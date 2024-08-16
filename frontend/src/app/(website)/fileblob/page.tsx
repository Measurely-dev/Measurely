'use client';

import { uploadUserAvatar } from '@/app/utils';
import { type PutBlobResult } from '@vercel/blob';
import { useRef, useState } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  return (
    <>
      <h1>Upload Your Avatar</h1>

      <input name='file' ref={inputFileRef} type='file' required />
      <button
        onClick={async () => {
          if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
          }

          const file = inputFileRef.current.files[0];

          const newBlob = await uploadUserAvatar(file);

          setBlob(newBlob);
        }}
      >
        Upload
      </button>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
}

