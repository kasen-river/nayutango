import './style.css'
import html2canvas from 'html2canvas';

const API_URL = "https://script.google.com/macros/s/AKfycbzJzZdYwsIx0fyBSdK1eLm3FnhssgTExPe0R3xQeiFQw-F8zhPEv136QtAb-6Z2pn5msQ/exec";

document.addEventListener('DOMContentLoaded', () => {

const display = document.querySelector('#gacha-display');
const gachaBtn = document.querySelector('#gacha-button');
const saveBtn = document.querySelector('#save-button');
const wordCountText = document.querySelector('#word-count');
const totalCountText = document.querySelector('#total-count');

// 追加フォーム用の要素もここで取得
const addBtn = document.querySelector('#add-button');
const newWordInput = document.querySelector('#new-word');
const userNameInput = document.querySelector('#user-name');

let wordList = [];

console.log("Button check:", addBtn); // これが Console に出るか確認

// データの読み込み
async function loadData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    wordList = data.words;
    wordCountText.innerText = wordList.length;
    // 原因候補：data.count が存在しないか、読み込めていない
totalCountText.innerText = data.count || 0; // || 0 を足すことで、空の時に 0 になります
    display.innerText = "準備完了";
  } catch (error) {
    display.innerText = "通信エラー";
  }
}

// ガチャを回す
async function playGacha() {
  if (wordList.length === 0) return;
  const randomIndex = Math.floor(Math.random() * wordList.length);
  let word = wordList[randomIndex];

  // --- 特殊装飾の変換処理 ---
  
  // 七色 (!文字!)
  word = word.replace(/!([^!]+)!/g, '<span class="font-rainbow">$1</span>');
  
  // 筆文字 ({文字})
  word = word.replace(/\{([^}]+)\}/g, '<span class="font-fude">$1</span>');
  
  // 筆記体 (~文字~) 
  word = word.replace(/~([^~]+)~/g, '<span class="font-cursive">$1</span>');

  // ルビ付きのパターンかチェックする
  if (word.includes('[') && word.includes(']')) {
    // ルビがある場合は、HTMLに変換して表示
    display.innerHTML = word.replace(/([^\[]+)\[([^\]]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
  } else {
    // ルビがない普通の単語なら、そのまま表示
    display.innerHTML = word;
  }

  try {
      // 空のデータではなく、適当なアクション名を送る
      fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'count' }) 
      });
      totalCountText.innerText = parseInt(totalCountText.innerText) + 1;
    } catch (e) { console.error(e); }
}

// 画像として保存
function saveImage() {
  html2canvas(display).then(canvas => {
    const link = document.createElement('a');
    link.download = 'nayutango.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

// 既存の playGacha 内の fetch 部分を修正
// body: JSON.stringify({ action: 'count' }) のように空じゃないデータを送る

// 単語追加

// 記号を無害化する
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function addWord() {

  // --- 投稿停止スイッチ ---
  const isMaintenance = false; // 止めたいときはここを true に変えるだけ
  if (isMaintenance) {
    return alert("現在、新規投稿は受け付けておりません。");
  }
  // -----------------------

  const rawWord = newWordInput.value;
  const rawName = userNameInput.value;
  
  const word = escapeHTML(rawWord);
  const name = escapeHTML(rawName);
  if (!word) return alert("単語を入力してください");

  addBtn.disabled = true; // 連打防止
  addBtn.innerText = "送信中...";

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ word: word, name: name })
    });
    alert("スプレッドシートに追加しました！");
    newWordInput.value = "";
  } catch (e) {
    alert("エラーが発生しました");
  } finally {
    addBtn.disabled = false;
    addBtn.innerText = "投稿";
  }
}

// --- イベントリスナー登録部分 ---
if (gachaBtn) gachaBtn.addEventListener('click', playGacha);
if (saveBtn) saveBtn.addEventListener('click', saveImage);
if (addBtn) addBtn.addEventListener('click', addWord); // これで null エラーが消えます

loadData();

});