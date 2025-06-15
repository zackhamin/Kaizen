import { EmergencyService, SupportService } from "./types";

export const supportServices: SupportService[] = [
    {
      name: 'NHS 111 Mental Health',
      phone: '111',
      hours: '24/7',
      description: 'Press option 2 for urgent mental health support',
      icon: 'medical',
      urgent: true,
    },
    {
      name: 'Samaritans',
      phone: '116 123',
      hours: '24/7',
      description: 'Free confidential emotional support for anyone',
      icon: 'heart',
      urgent: true,
    },
    {
      name: 'Crisis Text Support',
      phone: '85258',
      hours: '24/7',
      description: 'Text SHOUT for immediate crisis support',
      icon: 'chatbubble',
      specialty: 'Text Support',
    },
    {
      name: 'Mind Support',
      phone: '0300 102 1234',
      hours: '9am-6pm, Mon-Fri',
      description: 'Mental health information and support',
      icon: 'information-circle',
    },
    {
      name: 'CALM',
      phone: '0800 58 58 58',
      hours: '5pm-midnight daily',
      description: 'Support for men facing mental health challenges',
      icon: 'shield',
    },
    {
      name: 'SANEline',
      phone: '0300 304 7000',
      hours: '4:30pm-10pm daily',
      description: 'Mental health helpline and support',
      icon: 'call',
    },
  ];
  
  export const youngPersonServices: SupportService[] = [
    {
      name: 'Papyrus HOPELINEUK',
      phone: '0800 068 4141',
      hours: '24/7',
      description: 'Support for under 35s with suicidal feelings',
      icon: 'leaf',
      specialty: 'Under 35s',
    },
  ];

  export const emergencyServices: EmergencyService[] = [
    {
      name: '988 Crisis Lifeline',
      number: '988',
      description: '24/7 suicide prevention and mental health crisis support nationwide',
      icon: '🆘',
      color: '#FF3B30',
      priority: 'high',
      category: 'crisis'
    },
    {
      name: 'Emergency Services',
      number: '911',
      description: 'Life-threatening emergencies requiring immediate medical attention',
      icon: '🚨',
      color: '#FF9500',
      priority: 'high',
      category: 'crisis'
    },
    {
      name: 'Crisis Text Line',
      number: '741741',
      description: 'Text HOME to 741741 for 24/7 crisis support via text',
      icon: '💬',
      color: '#007AFF',
      priority: 'high',
      category: 'crisis'
    },
    {
      name: 'Trevor Lifeline (LGBTQ+ Youth)',
      number: '1-866-488-7386',
      description: '24/7 crisis support for LGBTQ+ young people under 25',
      icon: '🏳️‍🌈',
      color: '#AF52DE',
      priority: 'high',
      category: 'specialized'
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: '24/7 confidential support for domestic violence survivors',
      icon: '🛡️',
      color: '#34C759',
      priority: 'medium',
      category: 'specialized'
    },
    {
      name: 'Trans Lifeline',
      number: '877-565-8860',
      description: '24/7 peer support hotline for transgender people',
      icon: '🏳️‍⚧️',
      color: '#5AC8FA',
      priority: 'medium',
      category: 'specialized'
    },
    {
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      description: '24/7 mental health and substance abuse treatment referrals',
      icon: '🏥',
      color: '#32D74B',
      priority: 'medium',
      category: 'support'
    },
    {
      name: 'National Runaway Safeline',
      number: '1-800-786-2929',
      description: '24/7 support for runaway, homeless, and at-risk youth',
      icon: '🏠',
      color: '#FF9F0A',
      priority: 'low',
      category: 'specialized'
    },
  ];