
import { DicomStudy, WorklistItem } from './types';

export const MOCK_WORKLIST: WorklistItem[] = [
  {
    id: 'wk-001',
    patientName: 'Silva, Maria J.',
    patientId: 'P-10023',
    birthDate: '15/03/1975',
    modality: 'CT',
    scheduledTime: '2024-05-20 08:00',
    accessionNumber: 'ACC-2024-001',
    procedure: 'CT Torax S/C',
    status: 'arrived'
  },
  {
    id: 'wk-002',
    patientName: 'Oliveira, Carlos',
    patientId: 'P-10045',
    birthDate: '22/11/1982',
    modality: 'MR',
    scheduledTime: '2024-05-20 08:45',
    accessionNumber: 'ACC-2024-002',
    procedure: 'RM Cranio',
    status: 'scheduled'
  },
  {
    id: 'wk-003',
    patientName: 'Santos, Ana P.',
    patientId: 'P-10089',
    birthDate: '10/05/1990',
    modality: 'US',
    scheduledTime: '2024-05-20 09:15',
    accessionNumber: 'ACC-2024-003',
    procedure: 'US Abdomen Total',
    status: 'scheduled'
  },
  {
    id: 'wk-004',
    patientName: 'Ferreira, Roberto',
    patientId: 'P-10112',
    birthDate: '05/09/1968',
    modality: 'XR',
    scheduledTime: '2024-05-20 09:30',
    accessionNumber: 'ACC-2024-004',
    procedure: 'RX Torax PA/P',
    status: 'in-progress'
  },
  {
    id: 'wk-005',
    patientName: 'Costa, Lucia M.',
    patientId: 'P-10156',
    birthDate: '30/01/1995',
    modality: 'CT',
    scheduledTime: '2024-05-20 10:00',
    accessionNumber: 'ACC-2024-005',
    procedure: 'CT Abdomen C/C',
    status: 'scheduled'
  }
];

export const MOCK_RECEIVED: DicomStudy[] = [
  {
    id: 'st-001',
    patientName: 'Silva, Maria J.',
    patientId: 'P-10023',
    birthDate: '15/03/1975',
    modality: 'CT',
    studyDate: '2024-05-20',
    accessionNumber: 'ACC-2024-001',
    description: 'CT CHEST W/O CONTRAST',
    studyInstanceUID: '1.2.840.113619.2.55.3.153...',
    receivedAt: '08:23:15',
    status: 'received'
  }
];
