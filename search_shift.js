// 定義された順番
const HIRAGANA_SEQUENCE = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const ALPHABET_SEQUENCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

@@ -7,11 +6,11 @@ function searchShift() {
const resultArea = document.getElementById('shiftResultArea');
const countEl = document.getElementById('shiftCount');

    // オプション取得
const useStd = document.getElementById('useDictStandard_shift').checked;
const usePig = document.getElementById('useDictPig_shift').checked;
const useEng = document.getElementById('useDictEnglish_shift').checked;
const allowAnagram = document.getElementById('allowAnagram').checked;
    const allowPlusMinus = document.getElementById('allowPlusMinus').checked;

resultArea.innerHTML = "";

@@ -20,19 +19,16 @@ function searchShift() {
return;
}

    // 辞書作成
    let targetWords = [];
    if (useStd) targetWords = targetWords.concat(dictStandard);
    if (usePig) targetWords = targetWords.concat(dictPig);
    if (useEng) targetWords = targetWords.concat(dictEnglish);
    targetWords = [...new Set(targetWords)]; // 重複除去
    let targetDictKeys = [];
    if (useStd) targetDictKeys.push('std');
    if (usePig) targetDictKeys.push('pig');
    if (useEng) targetDictKeys.push('eng');

    if (targetWords.length === 0) {
    if (targetDictKeys.length === 0) {
countEl.innerText = "辞書を読み込み中または選択されていません";
return;
}

    // 入力文字の種別判定と正規化
let isAlphabet = /^[a-zA-Z]+$/.test(rawInput);
let sequence = "";
let normalizedInput = "";
@@ -42,12 +38,9 @@ function searchShift() {
normalizedInput = rawInput.toUpperCase();
} else {
sequence = HIRAGANA_SEQUENCE;
        // 濁音・半濁音・拗音を正規化して基本文字にする（同一視するため）
        // ただし、入力された文字がシーケンスにあるかチェック
normalizedInput = normalizeToSequence(rawInput, sequence);
}

    // 入力文字がシーケンスに含まれていない場合はエラー
for (let char of normalizedInput) {
if (!sequence.includes(char)) {
countEl.innerText = `対応していない文字が含まれています: ${char}`;
@@ -57,37 +50,100 @@ function searchShift() {

let results = [];

    // 全パターンのずらしを試行 (1文字ずらし 〜 length-1文字ずらし)
    // 例えば50音なら +1 〜 +45 まで（0は自分自身なので除外してもいいが、アナグラムの場合は0もありえる）
    // ここでは全ての可能性 (0 to len-1) を試す
    for (let shift = 0; shift < sequence.length; shift++) {
        // ずらした文字列を作成
        let shiftedString = "";
        for (let char of normalizedInput) {
            let index = sequence.indexOf(char);
            let shiftedIndex = (index + shift) % sequence.length;
            shiftedString += sequence[shiftedIndex];
        }
    if (allowPlusMinus) {
        let matched = [];
        
        targetDictKeys.forEach(key => {
            let dict = [];
            if(key === 'std') dict = dictStandard;
            if(key === 'pig') dict = dictPig;
            if(key === 'eng') dict = dictEnglish;

            dict.forEach(word => {
                if (word.length !== normalizedInput.length) return;
                const isWordAlpha = /^[a-zA-Z]+$/.test(word);
                if (isAlphabet !== isWordAlpha) return;

                let normalizedWord = "";
                if (isAlphabet) normalizedWord = word.toUpperCase();
                else normalizedWord = normalizeToSequence(word, sequence);

                let idxIn = sequence.indexOf(normalizedInput[0]);
                let idxWord = sequence.indexOf(normalizedWord[0]);
                if (idxIn === -1 || idxWord === -1) return;

                let diff = (idxWord - idxIn + sequence.length) % sequence.length;
                let shiftAmount = Math.min(diff, sequence.length - diff); 

                let isMatch = true;
                for (let i = 1; i < normalizedInput.length; i++) {
                    let iIn = sequence.indexOf(normalizedInput[i]);
                    let iW = sequence.indexOf(normalizedWord[i]);
                    if (iIn === -1 || iW === -1) { isMatch = false; break; }
                    
                    let d = (iW - iIn + sequence.length) % sequence.length;
                    let s = Math.min(d, sequence.length - d);
                    
                    if (s !== shiftAmount) {
                        isMatch = false;
                        break;
                    }
                }

                if (isMatch) {
                    matched.push(word);
                }
            });
        });

        // 辞書検索
        const matched = findInDictionary(shiftedString, targetWords, allowAnagram);
        matched = [...new Set(matched)];

if (matched.length > 0) {
            // ずらし数を計算（+N か -N かわかりやすい方を表示）
            let shiftLabel = "";
            if (shift === 0) shiftLabel = "そのまま";
            else if (shift <= sequence.length / 2) shiftLabel = `+${shift}`;
            else shiftLabel = `-${sequence.length - shift}`;

results.push({
                shift: shiftLabel,
                shiftedString: shiftedString,
                shift: "±同一視",
                shiftedString: "（複数パターン）",
words: matched
});
}

    } else {
        for (let shift = 0; shift < sequence.length; shift++) {
            let shiftedString = "";
            for (let char of normalizedInput) {
                let index = sequence.indexOf(char);
                let shiftedIndex = (index + shift) % sequence.length;
                shiftedString += sequence[shiftedIndex];
            }

            let matched = [];
            targetDictKeys.forEach(key => {
                if (allowAnagram) {
                    const sorted = shiftedString.split('').sort().join('');
                    const found = anagramMaps[key][sorted];
                    if (found) matched = matched.concat(found);
                } else {
                    if (dictSets[key].has(shiftedString)) {
                        matched.push(shiftedString);
                    }
                }
            });
            matched = [...new Set(matched)];
            
            if (matched.length > 0) {
                let shiftLabel = "";
                if (shift === 0) shiftLabel = "そのまま";
                else if (shift <= sequence.length / 2) shiftLabel = `+${shift}`;
                else shiftLabel = `-${sequence.length - shift}`;

                results.push({
                    shift: shiftLabel,
                    shiftedString: shiftedString,
                    words: matched
                });
            }
        }
}

    // 結果表示
if (results.length === 0) {
countEl.innerText = "見つかりませんでした";
resultArea.innerHTML = `<div class="no-result">条件に合う単語はありません</div>`;
@@ -99,9 +155,7 @@ function searchShift() {
results.forEach(res => {
const card = document.createElement('div');
card.className = 'group-card match-perfect';
        
const wordsHtml = res.words.map(w => `<span class="word-item">${w}</span>`).join("");
        
card.innerHTML = `
           <span class="group-name">
               ずらし: <span style="color:#e74c3c; font-size:1.2em;">${res.shift}</span> 
@@ -113,59 +167,19 @@ function searchShift() {
});
}

// 辞書内検索ロジック
function findInDictionary(searchStr, dictionary, isAnagram) {
    // アナグラム用にソートした文字列を用意
    const sortedSearchStr = searchStr.split('').sort().join('');
    
    return dictionary.filter(word => {
        // 文字数が違う場合は除外（アナグラムでも長さは同じはず）
        if (word.length !== searchStr.length) return false;

        // 比較用に辞書の単語も正規化
        let normalizedWord = "";
        const isAlpha = /^[a-zA-Z]+$/.test(word);
        if (isAlpha) {
            normalizedWord = word.toUpperCase();
        } else {
            normalizedWord = normalizeToSequence(word, HIRAGANA_SEQUENCE);
        }

        if (isAnagram) {
            // 並び替え許容：ソートして比較
            const sortedWord = normalizedWord.split('').sort().join('');
            return sortedSearchStr === sortedWord;
        } else {
            // 完全一致
            return searchStr === normalizedWord;
        }
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
        // ここでは word_data.js の normalizeString は使わず、
        // 五十音表独自の「同一視」ルールを適用する
        // (normalizeString は NFD分解などをするが、ここではマッピングで解決する)
        
let normalizedChar = char;
        
        // カタカナ -> ひらがな
if (/[\u30a1-\u30f6]/.test(char)) {
normalizedChar = String.fromCharCode(char.charCodeAt(0) - 0x60);
}

        // 濁点・半濁点・小文字の手動マッピング
const map = {
'が':'か', 'ぎ':'き', 'ぐ':'く', 'げ':'け', 'ご':'こ',
'ざ':'さ', 'じ':'し', 'ず':'す', 'ぜ':'せ', 'ぞ':'そ',
