
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
    description: 'CT Torax S/C',
    studyInstanceUID: '1.2.840.113619.2.55.3.4001',
    receivedAt: '08:23:15',
    status: 'received'
  },
  {
    id: 'st-002',
    patientName: 'Oliveira, Carlos',
    patientId: 'P-10045',
    birthDate: '22/11/1982',
    modality: 'MR',
    studyDate: '2024-05-20',
    accessionNumber: 'ACC-2024-002',
    description: 'RM Cranio S/C',
    studyInstanceUID: '1.2.840.113619.2.55.3.4002',
    receivedAt: '08:47:02',
    status: 'received'
  },
  {
    id: 'st-003',
    patientName: 'Santos, Ana P.',
    patientId: 'P-10089',
    birthDate: '10/05/1990',
    modality: 'US',
    studyDate: '2024-05-20',
    accessionNumber: 'ACC-2024-003',
    description: 'US Abdomen Total',
    studyInstanceUID: '1.2.840.113619.2.55.3.4003',
    receivedAt: '09:18:44',
    status: 'received'
  },
  {
    id: 'st-004',
    patientName: 'Ferreira, Roberto',
    patientId: 'P-10112',
    birthDate: '05/09/1968',
    modality: 'XR',
    studyDate: '2024-05-20',
    accessionNumber: 'ACC-2024-004',
    description: 'RX Torax PA e Perfil',
    studyInstanceUID: '1.2.840.113619.2.55.3.4004',
    receivedAt: '09:31:09',
    status: 'received'
  },
  {
    id: 'st-005',
    patientName: 'Costa, Lucia M.',
    patientId: 'P-10156',
    birthDate: '30/01/1995',
    modality: 'CT',
    studyDate: '2024-05-20',
    accessionNumber: 'ACC-2024-005',
    description: 'CT Abdomen C/C',
    studyInstanceUID: '1.2.840.113619.2.55.3.4005',
    receivedAt: '10:02:33',
    status: 'received'
  }
];
