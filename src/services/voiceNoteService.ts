import apiClient from './apiClient';
import {
    VoiceNoteResponse,
    VoiceNoteSummaryResponse,
    VoiceNoteRenameRequest,
} from '../types/types';

export const voiceNoteService = {
    // List all voice notes
    async listVoiceNotes(): Promise<VoiceNoteSummaryResponse[]> {
        const response = await apiClient.get<VoiceNoteSummaryResponse[]>('/api/voice-notes');
        return response.data;
    },

    // Upload voice note (multipart/form-data)
    // Note: Implementation pending backend developer confirmation
    async uploadVoiceNote(file: any, meta: any): Promise<VoiceNoteResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('meta', JSON.stringify(meta));

        const response = await apiClient.post<VoiceNoteResponse>('/api/voice-notes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Download voice note audio
    async downloadVoiceNote(id: number): Promise<Blob> {
        const response = await apiClient.get(`/api/voice-notes/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Rename voice note
    async renameVoiceNote(id: number, title: string): Promise<VoiceNoteResponse> {
        const data: VoiceNoteRenameRequest = { title };
        const response = await apiClient.put<VoiceNoteResponse>(
            `/api/voice-notes/${id}/rename`,
            data
        );
        return response.data;
    },

    // Export as PDF
    async exportPdf(id: number): Promise<Blob> {
        const response = await apiClient.get(`/api/voice-notes/${id}/export/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Export as Text
    async exportText(id: number): Promise<string> {
        const response = await apiClient.get<string>(`/api/export/text/${id}`);
        return response.data;
    },
};
