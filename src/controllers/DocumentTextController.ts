import { TextTemplate, TextTemplateCategory, OperationDocumentType } from '../types';
import { firebaseService } from '../services/firebaseService';

export interface DocumentTextState {
  activeGreeting: string;
  activeWarranty: string;
  activeExport: string;
  notes: string;
}

/**
 * DocumentTextController
 * Centralized Handler Engine for Greeting, Warranty, Export and Special Clause Texts.
 * Strictly bound to Global Settings / Firebase Storage.
 */
export class DocumentTextController {
  
  /**
   * Check if a string has non-whitespace content
   * Used for conditional rendering (if empty => returns null / 0 vertical space)
   */
  public static isNotEmpty(content?: string | null): boolean {
    if (!content) return false;
    return content.trim().length > 0;
  }

  /**
   * Get templates strictly filtered by category from global Settings
   */
  public static getTemplatesByCategory(category: TextTemplateCategory): TextTemplate[] {
    try {
      const all = firebaseService.getTextTemplates();
      return all
        .filter(t => {
          if (category === 'welcome') return t.category === 'welcome' || (t as any).category === 'begruessung';
          if (category === 'warranty') return t.category === 'warranty' || (t as any).category === 'gewaehrleistung';
          if (category === 'export') return t.category === 'export' || (t as any).category === 'zoll';
          return t.category === category;
        })
        .sort((a, b) => {
          // Standard / Default always first, then by orderIndex
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });
    } catch {
      return [];
    }
  }

  /**
   * Get default text for a given category from global Settings
   */
  public static getDefaultText(category: TextTemplateCategory, documentType?: OperationDocumentType): string {
    const list = this.getTemplatesByCategory(category);
    const defaultTemplate = list.find(t => t.isDefault) || list[0];
    
    if (defaultTemplate && this.isNotEmpty(defaultTemplate.content)) {
      return defaultTemplate.content.trim();
    }

    // Fallback defaults if no template is configured in Settings
    if (category === 'welcome') {
      if (documentType === 'angebot') {
        return 'Sehr geehrte Kundin, sehr geehrter Kunde,\n\nvielen Dank für Ihr Interesse an unserem Fahrzeugangebot. Gerne unterbreiten wir Ihnen nachfolgendes unverbindliches Angebot mit Preisbindung.';
      }
      return 'Sehr geehrte Kundin, sehr geehrter Kunde,\n\nvielen Dank für Ihr Vertrauen in unser Autohaus. Nachfolgend stellen wir Ihnen das erworbene Fahrzeug wie vereinbart in Rechnung.';
    }

    if (category === 'warranty') {
      return '12 Monate gesetzliche Sachmängelhaftung für Verbraucher (B2C) ab dem Tag der Fahrzeugübergabe. Bei gewerblichem Verkauf (B2B) erfolgt der Verkauf unter Ausschluss der Sachmängelhaftung gem. § 444 BGB.';
    }

    if (category === 'export') {
      if (documentType === 'export_drittland') {
        return 'Steuerfreie Ausfuhrlieferung in das Drittland gem. § 4 Nr. 1a i.V.m. § 6 UStG. Der Ausfuhrnachweis (Ausgangsvermerk ATLAS) wird erbracht.';
      }
      return 'Steuerfreie innergemeinschaftliche Lieferung gem. § 4 Nr. 1b i.V.m. § 6a UStG. Übergang der Steuerschuldnerschaft (Reverse Charge).';
    }

    return '';
  }

  /**
   * Initializes full state for a document
   */
  public static initializeDocumentTextState(documentType?: OperationDocumentType): DocumentTextState {
    return {
      activeGreeting: this.getDefaultText('welcome', documentType),
      activeWarranty: this.getDefaultText('warranty', documentType),
      activeExport: (documentType === 'eu_export' || documentType === 'export_drittland') 
        ? this.getDefaultText('export', documentType) 
        : '',
      notes: ''
    };
  }

  /**
   * Atomic selection transaction:
   * Sets text and returns callback payload ensuring menu close
   */
  public static handleSelectTemplate(
    template: TextTemplate,
    onTextUpdate: (newText: string) => void,
    onCloseDropdown: () => void
  ): void {
    onTextUpdate(template.content);
    onCloseDropdown();
  }
}
