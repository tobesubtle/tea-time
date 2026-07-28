'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface GooglePickerDocument {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

export function useGooglePicker(onPicked: (doc: GooglePickerDocument) => void) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

  // Google Scripts 동적 로드 (gapi + gis)
  useEffect(() => {
    let gapiLoaded = false;
    let gisLoaded = false;

    const checkReady = () => {
      if (gapiLoaded && gisLoaded) {
        setIsLoaded(true);
      }
    };

    // 1. gapi 스크립트 로드
    if (!document.getElementById('google-gapi-script')) {
      const scriptGapi = document.createElement('script');
      scriptGapi.id = 'google-gapi-script';
      scriptGapi.src = 'https://apis.google.com/js/api.js';
      scriptGapi.async = true;
      scriptGapi.onload = () => {
        window.gapi.load('picker', () => {
          gapiLoaded = true;
          checkReady();
        });
      };
      document.body.appendChild(scriptGapi);
    } else if (window.gapi) {
      gapiLoaded = true;
    }

    // 2. gis (Google Identity Services) 스크립트 로드
    if (!document.getElementById('google-gis-script')) {
      const scriptGis = document.createElement('script');
      scriptGis.id = 'google-gis-script';
      scriptGis.src = 'https://accounts.google.com/gsi/client';
      scriptGis.async = true;
      scriptGis.onload = () => {
        gisLoaded = true;
        checkReady();
      };
      document.body.appendChild(scriptGis);
    } else if (window.google?.accounts) {
      gisLoaded = true;
    }

    if (gapiLoaded && gisLoaded) {
      setIsLoaded(true);
    }
  }, []);

  const openPicker = useCallback(() => {
    if (!clientId || !apiKey) {
      setError('Google Client ID 및 API Key가 .env에 설정되지 않았습니다.');
      return false;
    }

    if (!window.google?.accounts?.oauth2 || !window.gapi?.picker) {
      setError('Google SDK 스크립트 로딩 중입니다. 잠시 후 다시 시도해 주세요.');
      return false;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            setError(`구글 인증 실패: ${response.error}`);
            return;
          }

          if (response.access_token) {
            // Google Picker 팝업 생성
            const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
            view.setMimeTypes('application/pdf,text/plain,application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

            const picker = new window.google.picker.PickerBuilder()
              .setDeveloperKey(apiKey)
              .setAppId(clientId)
              .setOAuthToken(response.access_token)
              .addView(view)
              .setCallback((data: any) => {
                if (data.action === window.google.picker.Action.PICKED) {
                  const doc = data.docs[0];
                  if (doc) {
                    onPicked({
                      id: doc.id,
                      name: doc.name,
                      url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
                      mimeType: doc.mimeType,
                    });
                  }
                }
              })
              .build();

            picker.setVisible(true);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: '' });
      return true;
    } catch (err: any) {
      console.error('Google Picker open error:', err);
      setError(`Picker 실행 실패: ${err?.message}`);
      return false;
    }
  }, [clientId, apiKey, onPicked]);

  return {
    isLoaded,
    hasCredentials: Boolean(clientId && apiKey),
    error,
    openPicker,
  };
}
