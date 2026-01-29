export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';

export interface SunoGenerateRequest {
  prompt: string;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  // Required when customMode=true:
  style?: string;
  title?: string;
}

export interface SunoApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

export interface SunoGenerateData {
  taskId: string;
}

export type SunoTaskStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'TEXT_SUCCESS'
  | 'FIRST_SUCCESS'
  | 'SUCCESS'
  | 'FAILED'
  | 'CREATE_TASK_FAILED'
  | 'GENERATE_AUDIO_FAILED'
  | 'CALLBACK_EXCEPTION'
  | 'SENSITIVE_WORD_ERROR';

export interface SunoRecordInfoTrack {
  id: string;
  audioUrl?: string;
  sourceAudioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  modelName?: string;
  title?: string;
  tags?: string;
  createTime?: string;
  duration?: number;
}

export interface SunoRecordInfoData {
  taskId: string;
  status: SunoTaskStatus;
  response?: {
    sunoData?: SunoRecordInfoTrack[];
  };
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface SunoStatusResponse {
  status: string;
  audio_urls?: string[];
  local_urls?: string[];
  image_urls?: string[];
  durations?: number[];
  error?: string;
}
