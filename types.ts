
export interface DicomStudy {
  id: string;
  patientName: string;
  patientId: string;
  birthDate: string;
  modality: string;
  studyDate: string;
  accessionNumber: string;
  description: string;
  studyInstanceUID: string;
  receivedAt: string;
  status: 'received' | 'processing' | 'archived';
}

export interface WorklistItem {
  id: string;
  patientName: string;
  patientId: string;
  birthDate: string;
  modality: string;
  scheduledTime: string;
  accessionNumber: string;
  procedure: string;
  status: 'scheduled' | 'arrived' | 'in-progress' | 'completed';
  studyInstanceUID?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export interface AppSettings {
  pacs: {
    aeTitle: string;
    port: number;
    wsUrl: string;
  };
  ris: {
    enabled: boolean;
    aeTitle: string; // Called AE
    host: string;
    port: number;
    pollingInterval: number;
  };
  workflow: {
    autoHideLinked: boolean;
  };
}
