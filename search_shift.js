normalizedInput = rawInput.toUpperCase();
} else {
sequence = HIRAGANA_SEQUENCE;
        normalizedInput = normalizeString(rawInput); // word_data.js の関数を利用
        // ただしシーケンスに含まれない文字（正規化しても）があるかチェック
        // normalizeStringは「っ->つ」等はするが、シーケンス外の記号等は残る可能性がある
        // 濁音・半濁音・拗音を正規化して基本文字にする（同一視するため）
        normalizedInput = normalizeToSequence(rawInput, sequence);
}

    // 入力文字がシーケンスに含まれていない場合はエラー
for (let char of normalizedInput) {
if (!sequence.includes(char)) {
countEl.innerText = `対応していない文字が含まれています: ${char}`;
@@ -70,12 +70,15 @@ function searchShift() {
if(key === 'eng') dict = dictEnglish;

dict.forEach(word => {
                // 文字数チェック
if (word.length !== normalizedInput.length) return;
const isWordAlpha = /^[a-zA-Z]+$/.test(word);
if (isAlphabet !== isWordAlpha) return;

// 辞書単語も正規化
                let normalizedWord = normalizeString(word);
                let normalizedWord = "";
                if (isAlphabet) normalizedWord = word.toUpperCase();
                else normalizedWord = normalizeToSequence(word, sequence);

// 1文字目のズレ幅(絶対値)を計算
let idxIn = sequence.indexOf(normalizedInput[0]);
@@ -122,8 +125,9 @@ function searchShift() {
} else {
// [通常モード] (固定ずらし + アナグラム)

        // 全パターンのずらしを試行
        // 全パターンのずらしを試行 (0 to len-1)
for (let shift = 0; shift < sequence.length; shift++) {
            // ずらした文字列を作成
let shiftedString = "";
for (let char of normalizedInput) {
let index = sequence.indexOf(char);
@@ -189,3 +193,44 @@ function searchShift() {
resultArea.appendChild(card);
});
}

// 入力文字列を、指定されたシーケンス内の文字に正規化する
// (濁点・小文字などを、シーケンスにある親文字に変換)
function normalizeToSequence(str, sequence) {
    let res = "";
    for (let char of str) {
        // そのままシーケンスにあればOK
        if (sequence.includes(char)) {
            res += char;
            continue;
        }
        
        // 正規化（濁点除去・小文字変換）してトライ
        // 五十音表独自の「同一視」ルール
        let normalizedChar = char;
        
        // カタカナ -> ひらがな
        if (/[\u30a1-\u30f6]/.test(char)) {
            normalizedChar = String.fromCharCode(char.charCodeAt(0) - 0x60);
        }

        // 濁点・半濁点・小文字の手動マッピング
        const map = {
            'が':'か', 'ぎ':'き', 'ぐ':'く', 'げ':'け', 'ご':'こ',
            'ざ':'さ', 'じ':'し', 'ず':'す', 'ぜ':'せ', 'ぞ':'そ',
            'だ':'た', 'ぢ':'ち', 'づ':'つ', 'で':'て', 'ど':'と',
            'ば':'は', 'び':'ひ', 'ぶ':'ふ', 'べ':'へ', 'ぼ':'ほ',
            'ぱ':'は', 'ぴ':'ひ', 'ぷ':'ふ', 'ぺ':'へ', 'ぽ':'ほ',
            'ぁ':'あ', 'ぃ':'い', 'ぅ':'う', 'ぇ':'え', 'ぉ':'お',
            'っ':'つ', 'ゃ':'や', 'ゅ':'ゆ', 'ょ':'よ', 'ゎ':'わ',
            'ゔ':'う', 'ゐ':'い', 'ゑ':'え'
        };
        
        if (map[normalizedChar]) {
            normalizedChar = map[normalizedChar];
        }

        res += normalizedChar;
    }
    return res;
}
