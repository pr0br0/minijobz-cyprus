"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Shield, FileText, Database, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface PrivacySection {
  title: {
    en: string;
    el: string;
  };
  content: {
    en: string;
    el: string;
  };
}

const privacySections: PrivacySection[] = [
  {
    title: {
      en: "Information We Collect",
      el: "Πληροφορίες που Συλλέγουμε"
    },
    content: {
      en: "We collect information you provide directly to us, such as when you create an account, apply for jobs, or contact us. This includes:\n\n• Personal identification information (name, email address, phone number)\n• Professional information (CV, work experience, skills)\n• Job application data and communication history\n• Company information for employers\n• Technical data (IP address, browser information, device data)\n• Usage data and interaction with our platform",
      el: "Συλλέγουμε πληροφορίες που μας παρέχετε απευθείας, όπως όταν δημιουργείτε λογαριασμό, υποβάλλετε αίτηση για θέσεις εργασίας ή επικοινωνείτε μαζί μας. Αυτό περιλαμβάνει:\n\n• Προσωπικά στοιχεία ταυτοποίησης (όνομα, διεύθυνση email, αριθμός τηλεφώνου)\n• Επαγγελματικές πληροφορίες (βιογραφικό, εργασιακή εμπειρία, δεξιότητες)\n• Δεδομένα αιτήσεων εργασίας και ιστορικό επικοινωνίας\n• Πληροφορίες εταιρείας για εργοδότες\n• Τεχνικά δεδομένα (διεύθυνση IP, πληροφορίες προγράμματος περιήγησης, δεδομένα συσκευής)\n• Δεδομένα χρήσης και αλληλεπίδρασης με την πλατφόρμα μας"
    }
  },
  {
    title: {
      en: "How We Use Your Information",
      el: "Πώς Χρησιμοποιούμε τις Πληροφορίες Σας"
    },
    content: {
      en: "We use the information we collect to:\n\n• Provide and maintain our job board platform\n• Process job applications and connect job seekers with employers\n• Improve our services and develop new features\n• Communicate with you about your account and applications\n• Send job alerts and marketing communications (with your consent)\n• Comply with legal obligations and protect our platform\n• Generate analytics and insights to improve user experience\n• Enforce our Terms of Service and privacy policies",
      el: "Χρησιμοποιούμε τις πληροφορίες που συλλέγουμε για:\n\n• Παροχή και συντήρηση της πλατφόρμας πίνακα θέσεων εργασίας μας\n• Επεξεργασία αιτήσεων εργασίας και σύνδεση αναζητητών εργασίας με εργοδότες\n• Βελτίωση των υπηρεσιών μας και ανάπτυξη νέων χαρακτηριστικών\n• Επικοινωνία μαζί σας σχετικά με τον λογαριασμό και τις αιτήσεις σας\n• Αποστολή ειδοποιήσεων θέσεων εργασίας και εμπορικών επικοινωνιών (με τη συγκατάθεσή σας)\n• Συμμόρφωση με νομικές υποχρεώσεις και προστασία της πλατφόρμας μας\n• Δημιουργία αναλυτικών στοιχείων και πληροφοριών για βελτίωση της εμπειρίας χρήστη\n• Επιβολή των Όρων Υπηρεσίας και των πολιτικών απορρήτου μας"
    }
  },
  {
    title: {
      en: "Data Sharing and Disclosure",
      el: "Κοινή Χρήση και Αποκάλυψη Δεδομένων"
    },
    content: {
      en: "We do not sell your personal information. We share data only:\n\n• With employers when you apply for jobs\n• With service providers who assist us in operating our platform\n• When required by law or legal process\n• To protect our rights, privacy, safety, or property\n• With your explicit consent\n\nAll third-party service providers are bound by confidentiality obligations and GDPR compliance requirements.",
      el: "Δεν πουλάμε τις προσωπικές σας πληροφορίες. Μοιραζόμαστε δεδομένα μόνο:\n\n• Με εργοδότες όταν υποβάλλετε αιτήσεις για θέσεις εργασίας\n• Με παρόχους υπηρεσιών που μας βοηθούν στη λειτουργία της πλατφόρμας μας\n• Όταν απαιτείται από το νόμο ή νομική διαδικασία\n• Για την προστασία των δικαιωμάτων, της ιδιωτικότητας, της ασφάλειας ή της περιουσίας μας\n• Με τη ρητή σας συγκατάθεση\n\nΌλοι οι τρίτοι πάροχοι υπηρεσιών είναι δεσμευμένοι από υποχρεώσεις εμπιστευτικότητας και απαιτήσεις συμμόρφωσης με τον GDPR."
    }
  },
  {
    title: {
      en: "Data Security",
      el: "Ασφάλεια Δεδομένων"
    },
    content: {
      en: "We implement appropriate technical and organizational measures to protect your personal data, including:\n\n• Encryption of sensitive data in transit and at rest\n• Secure authentication and access controls\n• Regular security assessments and penetration testing\n• Employee training on data protection\n• Incident response procedures\n• EU-based data hosting (Frankfurt/Stockholm)\n\nDespite our security measures, no internet transmission is completely secure. We cannot guarantee absolute security but strive to protect your information.",
      el: "Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων, συμπεριλαμβανομένων:\n\n• Κρυπτογράφηση ευαίσθητων δεδομένων κατά τη μεταφορά και στην ηρεμία\n• Ασφαλής πιστοποίηση και έλεγχοι πρόσβασης\n• Τακτικές αξιολογήσεις ασφάλειας και δοκιμές διείσδυσης\n• Εκπαίδευση υπαλλήλων στην προστασία δεδομένων\n• Διαδικασίες απόκρισης περιστατικών\n• Φιλοξενία δεδομένων στην ΕΕ (Φρανκφούρτη/Στοκχόλμη)\n\nΠαρά τα μέτρα ασφάλειάς μας, καμία διαδικτυακή μετάδοση δεν είναι εντελώς ασφαλής. Δεν μπορούμε να εγγυηθούμε απόλυτη ασφάλεια αλλά προσπαθούμε να προστατεύσουμε τις πληροφορίες σας."
    }
  },
  {
    title: {
      en: "Your GDPR Rights",
      el: "Τα Δικαιώματά Σας GDPR"
    },
    content: {
      en: "Under GDPR, you have the following rights:\n\n• Right to access: Request a copy of your personal data\n• Right to rectification: Correct inaccurate personal data\n• Right to erasure: Request deletion of your data (Right to be forgotten)\n• Right to restriction: Limit processing of your data\n• Right to data portability: Receive your data in a machine-readable format\n• Right to object: Object to certain types of processing\n• Right to withdraw consent: Remove consent for data processing\n• Right to complain: Contact supervisory authorities\n\nYou can exercise these rights through your account dashboard or by contacting us.",
      el: "Σύμφωνα με τον GDPR, έχετε τα ακόλουθα δικαιώματα:\n\n• Δικαίωμα πρόσβασης: Αίτημα για αντίγραφο των προσωπικών σας δεδομένων\n• Δικαίωμα διόρθωσης: Διόρθωση ανακριβών προσωπικών δεδομένων\n• Δικαίωμα διαγραφής: Αίτημα διαγραφής των δεδομένων σας (Δικαίωμα στη λήθη)\n• Δικαίωμα περιορισμού: Περιορισμός επεξεργασίας των δεδομένων σας\n• Δικαίωμα φορητότητας δεδομένων: Λήψη των δεδομένων σας σε μηχανικά αναγνώσιμη μορφή\n• Δικαίωμα αντίρρησης: Αντίρρηση σε ορισμένους τύπους επεξεργασίας\n• Δικαίωμα ανάκλησης συγκατάθεσης: Αφαίρεση συγκατάθεσης για επεξεργασία δεδομένων\n• Δικαίωμα παραπόνου: Επικοινωνία με εποπτικές αρχές\n\nΜπορείτε να ασκήσετε αυτά τα δικαιώματα μέσω του πίνακα ελέγχου του λογαριασμού σας ή επικοινωνώντας μαζί μας."
    }
  },
  {
    title: {
      en: "Data Retention",
      el: "Διατήρηση Δεδομένων"
    },
    content: {
      en: "We retain personal data only as long as necessary:\n\n• Active accounts: Data retained while account is active\n• Inactive accounts: Automatically deleted after 2 years of inactivity\n• Job applications: Retained for 2 years after application or until deleted\n• CV files: Securely stored and deleted upon account closure or request\n• Consent logs: Retained for compliance purposes (5 years)\n• Audit logs: Retained for security and compliance (5 years)\n• Marketing data: Deleted upon consent withdrawal or account closure\n\nYou can request immediate deletion of your data at any time through your account settings.",
      el: "Διατηρούμε προσωπικά δεδομένα μόνο όσο είναι απαραίτητο:\n\n• Ενεργοί λογαριασμοί: Δεδομένα διατηρούνται όσο ο λογαριασμός είναι ενεργός\n• Ανενεργοί λογαριασμοί: Αυτόματη διαγραφή μετά από 2 χρόνια αδράνειας\n• Αιτήσεις εργασίας: Διατηρούνται για 2 χρόνια μετά την αίτηση ή μέχρι τη διαγραφή\n• Αρχεία βιογραφικού: Ασφαλής αποθήκευση και διαγραφή κατά το κλείσιμο του λογαριασμού ή αίτημα\n• Καταγραφές συγκατάθεσης: Διατηρούνται για λόγους συμμόρφωσης (5 χρόνια)\n• Καταγραφές ελέγχου: Διατηρούνται για ασφάλεια και συμμόρφωση (5 χρόνια)\n• Δεδομένα μάρκετινγκ: Διαγράφονται κατά την ανάκληση συγκατάθεσης ή κλείσιμο λογαριασμού\n\nΜπορείτε να ζητήσετε άμεση διαγραφή των δεδομένων σας οποιαδήποτε στιγμή μέσω των ρυθμίσεων του λογαριασμού σας."
    }
  },
  {
    title: {
      en: "International Data Transfers",
      el: "Διεθνείς Μεταφορές Δεδομένων"
    },
    content: {
      en: "Our platform is hosted entirely within the European Union:\n\n• Primary servers located in Frankfurt, Germany and Stockholm, Sweden\n• All data processing occurs within EU jurisdiction\n• No data transfers to third countries outside the EU/EEA\n• Compliance with EU data protection standards\n• GDPR-compliant service providers only\n\nWe ensure that all international data transfers comply with GDPR requirements through appropriate safeguards.",
      el: "Η πλατφόρμα μας φιλοξενείται εξ ολοκλήρου εντός της Ευρωπαϊκής Ένωσης:\n\n• Κύριοι διακομιστές βρίσκονται στη Φρανκφούρτη, Γερμανία και Στοκχόλμη, Σουηδία\n• Όλη η επεξεργασία δεδομένων γίνεται εντός της δικαιοδοσίας της ΕΕ\n• Καμία μεταφορά δεδομένων σε τρίτες χώρες εκτός ΕΕ/ΕΟΧ\n• Συμμόρφωση με τα πρότυπα προστασίας δεδομένων της ΕΕ\n• Μόνο πάροχοι υπηρεσιών συμμορφωμένοι με τον GDPR\n• Διασφαλίζουμε ότι όλες οι διεθνείς μεταφορές δεδομένων συμμορφώνονται με τις απαιτήσεις του GDPR μέσω κατάλληλων εγγυήσεων."
    }
  },
  {
    title: {
      en: "Cookies and Tracking",
      el: "Cookies και Παρακολούθηση"
    },
    content: {
      en: "We use cookies and similar technologies to:\n\n• Essential cookies: Required for basic platform functionality\n• Preference cookies: Remember your settings and language choices\n• Analytics cookies: Help us understand how you use our platform\n• Marketing cookies: Used with your consent for personalized advertising\n\nYou can manage cookie preferences through our cookie banner or browser settings. We provide clear opt-in/opt-out options and respect your choices.",
      el: "Χρησιμοποιούμε cookies και παρόμοιες τεχνολογίες για:\n\n• Απαραίτητα cookies: Απαιτούνται για βασική λειτουργικότητα της πλατφόρμας\n• Cookies προτιμήσεων: Απομνημόνευση των ρυθμίσεων και των γλωσσικών επιλογών σας\n• Cookies αναλυτικών: Μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείτε την πλατφόρμα μας\n• Cookies μάρκετινγκ: Χρησιμοποιούνται με τη συγκατάθεσή σας για εξατομικευμένη διαφήμιση\n\nΜπορείτε να διαχειριστείτε τις προτιμήσεις cookies μέσω του banner cookies ή των ρυθμίσεων του προγράμματος περιήγησης. Παρέχουμε σαφείς επιλογές opt-in/opt-out και σέβομαστε τις επιλογές σας."
    }
  },
  {
    title: {
      en: "Contact Information",
      el: "Πληροφορίες Επικοινωνίας"
    },
    content: {
      en: "For privacy-related questions or to exercise your GDPR rights:\n\nData Protection Officer (DPO):\nEmail: privacy@cyprusjobs.com\nPhone: +357 12 345 678\nAddress: 123 Stasinou Street, Nicosia 1065, Cyprus\n\nGeneral Inquiries:\nEmail: support@cyprusjobs.com\nPhone: +357 12 345 679\n\nYou can also exercise your rights directly through your account dashboard.\n\nRegistered with Cyprus Data Protection Office: Registration #DPA-2024-001",
      el: "Για ερωτήματα σχετικά με την ιδιωτικότητα ή για να ασκήσετε τα δικαιώματά σας GDPR:\n\nΥπεύθυνος Προστασίας Δεδομένων (DPO):\nEmail: privacy@cyprusjobs.com\nΤηλέφωνο: +357 12 345 678\nΔιεύθυνση: Οδός Στασίνου 123, Λευκωσία 1065, Κύπρος\n\nΓενικές Ερωτήσεις:\nEmail: support@cyprusjobs.com\nΤηλέφωνο: +357 12 345 679\n\nΜπορείτε επίσης να ασκήσετε τα δικαιώματά σας απευθείας μέσω του πίνακα ελέγχου του λογαριασμού σας.\n\nΕγγεγραμμένοι στο Γραφείο Προστασίας Δεδομένων Κύπρου: Αριθμός Μητρώου #DPA-2024-001"
    }
  },
  {
    title: {
      en: "Updates to This Policy",
      el: "Ενημερώσεις αυτής της Πολιτικής"
    },
    content: {
      en: "We may update this privacy policy from time to time. The updated version will be indicated by a revised 'Last Updated' date.\n\nMaterial changes will be notified:\n• By email to registered users\n• Through prominent notices on our platform\n• Via in-app notifications\n\nWe encourage you to review this policy periodically for any changes. Your continued use of our platform constitutes acceptance of the updated policy.",
      el: "Μπορούμε να ενημερώνουμε αυτή την πολιτική απορρήτου κατά καιρούς. Η ενημερωμένη έκδοση θα υποδεικνύεται από μια αναθεωρημένη ημερομηνία 'Τελευταία Ενημέρωση'.\n\nΣημαντικές αλλαγές θα ειδοποιούνται:\n• Μέσω email στους εγγεγραμμένους χρήστες\n• Μέσω εμφανών ειδοποιήσεων στην πλατφόρμα μας\n• Μέσω ειδοποιήσεων στην εφαρμογή\n\nΣας ενθαρρύνουμε να επανεξετάζετε αυτή την πολιτική περιοδικά για τυχόν αλλαγές. Η συνεχής χρήση της πλατφόρμας μας αποτελεί αποδοχή της ενημερωμένης πολιτικής."
    }
  }
];

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState<'en' | 'el'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'el' : 'en');
  };

  const lastUpdated = {
    en: "Last Updated: November 15, 2024",
    el: "Τελευταία Ενημέρωση: 15 Νοεμβρίου 2024"
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Privacy Policy' : 'Πολιτική Απορρήτου'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'GDPR-Compliant Privacy Policy for Cyprus Jobs Platform' 
                : 'Πολιτική Απορρήτου Συμμορφούμενη με τον GDPR για την Πλατφόρμα Θέσεων Εργασίας Κύπρου'
              }
            </p>
          </div>
          <Button
            onClick={toggleLanguage}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'Ελληνικά' : 'English'}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {lastUpdated[language]}
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Shield className="w-3 h-3 mr-1" />
            {language === 'en' ? 'GDPR Compliant' : 'Συμμόρφωση GDPR'}
          </Badge>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="mb-8 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <FileText className="w-5 h-5" />
            {language === 'en' ? 'Overview' : 'Επισκόπηση'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {language === 'en' 
              ? 'Cyprus Jobs is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This privacy policy explains how we collect, use, store, and protect your personal information when you use our job board platform.'
              : 'Το Cyprus Jobs δεσμεύεται να προστατεύει την ιδιωτικότητά σας και να εξασφαλίζει συμμόρφωση με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR) και άλλους εφαρμόσιμους νόμους προστασίας δεδομένων. Αυτή η πολιτική απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε, αποθηκεύουμε και προστατεύουμε τις προσωπικές σας πληροφορίες όταν χρησιμοποιείτε την πλατφόρμα πίνακα θέσεων εργασίας μας.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Privacy Sections */}
      <div className="space-y-6">
        {privacySections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {section.title[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {section.content[language].split('\n').map((paragraph, pIndex) => {
                  if (paragraph.trim() === '') return null;
                  if (paragraph.startsWith('•')) {
                    return (
                      <li key={pIndex} className="ml-4 text-gray-700">
                        {paragraph.substring(1).trim()}
                      </li>
                    );
                  }
                  return (
                    <p key={pIndex} className="text-gray-700 mb-3 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Card */}
      <Card className="mt-8 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Mail className="w-5 h-5" />
            {language === 'en' ? 'Questions or Concerns?' : 'Ερωτήσεις ή Ανησυχίες;'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            {language === 'en' 
              ? 'If you have any questions about this privacy policy or how we handle your personal data, please contact our Data Protection Officer or support team.'
              : 'Εάν έχετε οποιεσδήποτε ερωτήσεις σχετικά με αυτή την πολιτική απορρήτου ή πώς διαχειριζόμαστε τα προσωπικά σας δεδομένα, παρακαλούμε επικοινωνήστε με τον Υπεύθυνο Προστασίας Δεδομένων ή την ομάδα υποστήριξης.'
            }
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">privacy@cyprusjobs.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">+357 12 345 678</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Nicosia, Cyprus</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm">DPA #DPA-2024-001</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p>
          {language === 'en' 
            ? '© 2024 Cyprus Jobs. All rights reserved. | GDPR Compliant | EU-Based'
            : '© 2024 Cyprus Jobs. Με την επιφύλαξη παντός δικαιώματος. | Συμμόρφωση GDPR | Με έδρα την ΕΕ'
          }
        </p>
      </div>
    </div>
  );
}