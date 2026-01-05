import apiClient from './apiClient';
import {
    VoiceNoteResponse,
    VoiceNoteSummaryResponse,
    VoiceNoteRenameRequest,
} from '../types/types';

export const voiceNoteService = {
    async listVoiceNotes(): Promise<VoiceNoteSummaryResponse[]> {
        const response = await apiClient.get<VoiceNoteSummaryResponse[]>('/api/voice-notes');
        return response.data;
    },

    async uploadVoiceNote(file: any, meta: any): Promise<VoiceNoteResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('meta', JSON.stringify(meta));
        const response = await apiClient.post<VoiceNoteResponse>('/api/voice-notes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 0
        });
        return response.data;
    },

    async downloadVoiceNote(id: number): Promise<Blob> {
        const response = await apiClient.get(`/api/voice-notes/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    async renameVoiceNote(id: number, title: string): Promise<VoiceNoteResponse> {
        const data: VoiceNoteRenameRequest = { title };
        const response = await apiClient.put<VoiceNoteResponse>(
            `/api/voice-notes/${id}/rename`,
            data
        );
        return response.data;
    },

    async exportPdf(id: number): Promise<Blob> {
        const response = await apiClient.get(`/api/voice-notes/${id}/export/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    async exportText(id: number): Promise<string> {
        const response = await apiClient.get<string>(`/api/export/text/${id}`);
        return response.data;
    },
};
