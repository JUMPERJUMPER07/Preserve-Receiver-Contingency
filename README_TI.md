# Integração do Frontend (Contingência DICOM) com o Backend

Olá equipe de TI,

Este repositório contém o **Frontend** da "Staging Zone" (Painel de Contingência e Qualidade DICOM). A aplicação foi desenvolvida em **React (TypeScript)** usando o **Vite** e utiliza **Tailwind CSS** para estilização.

## 🎯 Qual é o objetivo deste sistema?
O sistema atua como uma camada visual sobre o nosso **PACS Local** (que funciona como motor de armazenamento e envio). Ele serve para gerenciar e corrigir estudos cujas tags DICOM (Patient ID, Accession Number) chegaram incompletas ou incorretas das modalidades.

Através desta interface, os usuários podem **cruzar** visualmente os exames parados no PACS Local com os agendamentos reais do RIS (Worklist) e forçar a vinculação correta antes do envio final para o PACS da Nuvem/Externo.

## ⚙️ O que precisa ser integrado no Backend?
No momento, a interface possui **dados "mockados"** (simulações) para que a interface pudesse ser desenhada e o fluxo aprovado. Para colocar este projeto em produção real com o nosso PACS, vocês precisarão realizar os seguintes passos:

### 1. Remover Dados Falsos (Mock)
* O arquivo principal de integração é o `App.tsx`.
* Dentro dele, as funções `generateMockRisItem()` e o timer de `SimulatedStudy` (Demo PACS simulation) devem ser desativados ou removidos.

### 2. Conectar a Busca do RIS (Worklist)
* Atualmente, a variável de estado `worklist` é populada por mocks.
* Vocês precisarão criar chamadas reais via `fetch()` ou `axios` para o nosso banco do RIS ou API do sistema de agendamento do hospital.
* Os dados devem popular a lista no formato da interface `WorklistItem` definido em `types.ts`.

### 3. Conectar a Recepção do PACS Local
* O sistema possui uma conexão WebSocket (WS) pronta no `App.tsx` que escuta novos exames. 
* Se o nosso PACS local tiver suporte a WebSockets para eventos de *InstanceStored* ou *StudyStored*, basta apontar a URL (ex: `ws://localhost:8080/dicom-receiver`).
* Caso contrário, a arquitetura pode ser alterada para um *Long Polling* via HTTP(S) buscando na API REST do PACS local os estudos recentes não enviados.

### 4. Implementar a Ação "Vincular e Enviar"
* A função `handleConfirmLink(study, worklistItem)` é ativada quando o usuário aprova o "Match" na interface.
* Vocês precisarão incluir dentro desta função uma requisição `POST` ou `PUT` para a API do PACS Local instruindo:
  1. Alteração (Modification) das tags DICOM (`AccessionNumber`, `PatientID`, `PatientName`) daquele estudo específico para os dados vindos do `worklistItem`.
  2. Acionamento do roteamento DICOM (C-STORE / C-MOVE / Push) para o servidor central após a modificação.

---

### Scripts Básicos
Para rodar este código para desenvolvimento e testes:
```bash
npm install
npm run dev
```

Para gerar a build de produção:
```bash
npm run build
```

Qualquer dúvida sobre os componentes React, a estrutura está separada na pasta `/components`. Bom trabalho!
