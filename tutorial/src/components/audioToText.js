const express = require('express');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const speechClient = new SpeechClient();

// 멀터를 사용하여 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Google Cloud Speech-to-Text API 설정
const audioToText = async (audioBuffer) => {
  const request = {
    audio: {
      content: audioBuffer.toString('base64'),
    },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'ko-KR', // 한국어
    },
  };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  } catch (error) {
    console.error('Google Cloud Speech 오류: ', error);
    throw new Error('Speech recognition failed');
  }
};

// 음성 파일을 받아서 텍스트로 변환
app.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  const { buffer } = req.file;

  try {
    const text = await audioToText(buffer);
    res.json({ text });
  } catch (error) {
    res.status(500).send('Error processing audio');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
