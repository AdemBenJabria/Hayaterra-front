import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiRseService } from '../rseAI.service';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-rse-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass], 
  templateUrl: './rse-ai.component.html',
  styleUrls: ['./rse-ai.component.scss']
})
export class RseAIComponent {
  loading = false;
  userInput: string = '';
  chatMessages: any[] = [];
  presetQuestions: string[] = [
    'Comment améliorer notre impact environnemental?',
    'Comment mettre en place la RSE dans mon entreprise?',
    'Comment intégrer la RSE dans notre stratégie d’entreprise?'
  ];

  constructor(private aiRseService: AiRseService) {}

  sendMessage() {
    if (this.userInput.trim()) {
      this.chatMessages.push({ role: 'user', content: this.userInput });
  
      this.userInput = ''; // Efface l'entrée après l'envoi du message
      this.loading = true; // Démarre l'animation de chargement
  
      // Crée un pré-prompt pour guider Gemini
      const prePrompt = `
Vous êtes un assistant IA spécialisé en Responsabilité Sociétale des Entreprises (RSE).
Votre objectif est de fournir des réponses complètes mais concises aux questions de l'utilisateur sur la RSE, afin de leur donner une bonne compréhension du sujet sans entrer dans tous les détails.

Pour chaque question :
1. Offrez une réponse complète et informative qui couvre les points essentiels du sujet.
2. Mentionnez qu'il existe des ressources supplémentaires, telles que des kits, où l'utilisateur peut trouver des informations détaillées.

Si la question de l'utilisateur concerne ou peut être associée à l'un des éléments suivants, répondez de manière concise mais complète et redirigez-les vers le kit approprié disponible à la vente sur <a href="https://hayaterra.onrender.com/kits">https://hayaterra.onrender.com/kits</a> :

- **Kit RSE** : Programme de sensibilisation, Idées ateliers RSE, Plan de communication, Les Objectifs du Développement Durable c'est quoi, Sujets Phare de la RSE Les Notions à Absolument Connaître, C'est quoi la RSE, 7 Questions centrales et 36 Domaines d'actions, Idées calendrier RSE, Calendrier RSE, 3 méthodes RSE, Définir ses axes, Glossaire RSE, Grille auto-diagnostic.

- **Kit Gouvernance** : Plan de communication, Charte Éthique, Politique de Développement Durable, C'est quoi la RSE, Objectifs du Développement Durable ça sert à quoi, Déterminer sa raison d’être, 3 méthodes RSE, Définir ses axes, 7 Questions centrales et 36 Domaines d'actions, Politique RSE, Guide des 20 outils de gestion de projet, Comprendre la gouvernance, Partenaires, Matrice de matérialité, Politique de gouvernance, Code de conduite Fournisseurs, Questionnaires Parties prenantes.

- **Kit Économique** : Guide achats responsable, Calendrier RSE, Idées calendrier RSE, Partenaires RSE, Plan de communication, Questionnaires fournisseurs, Idées d'innovations durables, Questionnaire satisfaction.

- **Kit Environnement** : Guide achats responsable, Partenaires RSE, Idées ateliers environnement, Politique de Développement Durable, Politique des déchets, Affiche Consignes Tri guide du recyclage, Calendrier RSE, Idées calendrier RSE, Quizz environnement, Idées d'innovations durables, Charte de Bonnes Pratiques et Éco-gestes, Questionnaires fournisseurs.

- **Kit Social** : Partenaires RSE, Idées ateliers en société, Plan de communication, Calendrier RSE, Idées calendrier RSE, Atelier Intelligence Emotionnelle, Idées de bien-être, Quizz Atelier Intelligence Emotionnelle, Politique SST, Programme de sensibilisation, Programme de formation, Charte Éthique, Charte QVCT.

- **Kit Sociétal** : Plan de communication, Idées ateliers en société, Partenaires RSE, Idées calendrier RSE, Calendrier RSE, Programme de volontariat.

Par exemple, si l'utilisateur demande comment organiser un atelier d'Intelligence Emotionnelle, donnez une réponse succincte sur les étapes principales de l'organisation, puis redirigez-les vers le "Kit Social" disponible ici : <a href="https://hayaterra.onrender.com/kits">Kit Social</a>.

Si l'utilisateur demande une feuille de route ou pose une question nécessitant un diagnostic, proposez une réponse générale, puis redirigez-les vers : <a href="https://hayaterra.onrender.com/questionnaire">Questionnaire</a>.

Si l'utilisateur demande comment nous contacter, répondez avec : "Vous pouvez nous contacter à l'adresse suivante : <a href="mailto:Hayaterra-SAV@gmail.com">Hayaterra-SAV@gmail.com</a>".

Si une question n'est pas liée à la RSE ou aux produits que je vends, donnez une réponse brève en précisant que vous traitez principalement des questions relatives à la RSE et aux services proposés.
`;



  
      const fullPrompt = `${prePrompt}\nUtilisateur : ${this.chatMessages[this.chatMessages.length - 1].content}`;
  
      // Envoie le prompt complet au service d'IA
      this.aiRseService.getResponse(fullPrompt).subscribe(
        response => {
          console.log(response); // Vérifiez la structure de la réponse pour déboguer
  
          if (response && response.candidates && response.candidates[0] &&
            response.candidates[0].content && response.candidates[0].content.parts &&
            response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text) {
  
            let assistantMessage = response.candidates[0].content.parts[0].text;
            assistantMessage = this.convertToAscii(assistantMessage);
            this.chatMessages.push({ role: 'assistant', content: assistantMessage });
          } else {
            console.error('Unexpected response structure:', response);
            this.chatMessages.push({ role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.' });
          }
  
          this.loading = false; // Arrête l'animation de chargement après réception de la réponse
        },
        error => {
          console.error('Error fetching AI response:', error);
          this.chatMessages.push({ role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.' });
          this.loading = false; // Arrête l'animation de chargement même en cas d'erreur
        }
      );
    }
  }
  
  
  
  
  convertToAscii(text: string): string {
    return text
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>') // Remplace ## par <h2>
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')  // Remplace # par <h1>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Remplace les double astérisques par du texte en gras
      .replace(/\* (.*?)\n/g, '<li>$1</li>\n') // Remplace les puces par des éléments de liste
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') // Remplace les liens Markdown par des balises <a>
      .replace(/\n/g, '<br>'); // Conserve les retours à la ligne avec des <br>
  }
  
  
  
  sendPresetQuestion(question: string) {
    this.userInput = question;
    this.sendMessage();
  }
}
