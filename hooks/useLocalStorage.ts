import { useState } from 'react';

const ENCRYPTION_SALT = "prc_contingency_lgpd_2026_key";

function encrypt(text: string): string {
  try {
    const saltCodes = ENCRYPTION_SALT.split("").map(c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ saltCodes[i % saltCodes.length];
    }
    let binary = "";
    for (let i = 0; i < encrypted.length; i++) {
      binary += String.fromCharCode(encrypted[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error("Encryption error:", e);
    return text;
  }
}

function decrypt(ciphertext: string): string {
  try {
    const binary = atob(ciphertext);
    const saltCodes = ENCRYPTION_SALT.split("").map(c => c.charCodeAt(0));
    const data = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      data[i] = binary.charCodeAt(i) ^ saltCodes[i % saltCodes.length];
    }
    const decoder = new TextDecoder();
    return decoder.decode(data);
  } catch (e) {
    console.error("Decryption error:", e);
    return ciphertext;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  shouldEncrypt: boolean = false
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const rawData = shouldEncrypt ? decrypt(item) : item;
      return JSON.parse(rawData) as T;
    } catch (e) {
      console.warn('useLocalStorage: failed to read', key, e);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        const serialized = JSON.stringify(next);
        const dataToSave = shouldEncrypt ? encrypt(serialized) : serialized;
        window.localStorage.setItem(key, dataToSave);
        return next;
      });
    } catch (e) {
      console.warn('useLocalStorage: failed to write', key, e);
    }
  };

  return [storedValue, setValue];
}

