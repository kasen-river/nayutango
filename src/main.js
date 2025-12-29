import './style.css'
import html2canvas from 'html2canvas';

const API_URL = "https://script.google.com/macros/s/AKfycbzJzZdYwsIx0fyBSdK1eLm3FnhssgTExPe0R3xQeiFQw-F8zhPEv136QtAb-6Z2pn5msQ/exec";

const display = document.querySelector('#gacha-display');
const gachaBtn = document.querySelector('#gacha-button');
const saveBtn = document.querySelector('#save-button');
const wordCountText = document.querySelector('#word-count');
const totalCountText = document.querySelector('#total-count');

let wordList = [];

// データの読み込み
async function loadData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    wordList = data.words;
    wordCountText.innerText = wordList.length;
    totalCountText.innerText = data.count;
    display.innerText = "準備完了！";
  } catch (error) {
    display.innerText = "通信エラー";
  }
}

// ガチャを回す
async function playGacha() {
  if (wordList.length === 0) return;
  const randomIndex = Math.floor(Math.random() * wordList.length);
  display.innerText = wordList[randomIndex];

  try {
    fetch(API_URL, { method: 'POST', mode: 'no-cors' });
    totalCountText.innerText = parseInt(totalCountText.innerText) + 1;
  } catch (e) { console.error(e); }
}

// 画像として保存
function saveImage() {
  html2canvas(display).then(canvas => {
    const link = document.createElement('a');
    link.download = 'gacha-result.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

gachaBtn.addEventListener('click', playGacha);
saveBtn.addEventListener('click', saveImage);

loadData();