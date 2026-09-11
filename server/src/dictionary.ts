import type { RegisterSet } from "./types.js";

/**
 * A curated phrase concept with three registers per language:
 *   - comune:    everyday, common speech
 *   - nobiliare: noble / refined speech
 *   - aulico:    courtly / high-literary speech
 *
 * The engine matches an input against any variant in the source language
 * and returns all three registers in the target language.
 */
export interface Concept {
  id: string;
  gloss: string;
  it: RegisterSet;
  zh: RegisterSet;
}

export const CONCEPTS: Concept[] = [
  {
    id: "greeting",
    gloss: "hello / greeting",
    it: { comune: "Ciao", nobiliare: "Buongiorno", aulico: "Vi porgo i miei ossequi" },
    zh: { comune: "你好", nobiliare: "您好", aulico: "敬颂台安" },
  },
  {
    id: "thanks",
    gloss: "thank you",
    it: { comune: "Grazie", nobiliare: "Vi ringrazio", aulico: "Vi sono grato oltremodo" },
    zh: { comune: "谢谢", nobiliare: "多谢", aulico: "感激不尽" },
  },
  {
    id: "please",
    gloss: "please",
    it: { comune: "Per favore", nobiliare: "Vi prego", aulico: "Se vi aggrada" },
    zh: { comune: "请", nobiliare: "敬请", aulico: "恳请" },
  },
  {
    id: "farewell",
    gloss: "goodbye",
    it: { comune: "Arrivederci", nobiliare: "Vogliate accomiatarvi", aulico: "Vi lascio con reverenza" },
    zh: { comune: "再见", nobiliare: "告辞", aulico: "就此别过" },
  },
  {
    id: "yes",
    gloss: "yes",
    it: { comune: "Sì", nobiliare: "Certamente", aulico: "In verità sì" },
    zh: { comune: "是", nobiliare: "是的", aulico: "诚然" },
  },
  {
    id: "no",
    gloss: "no",
    it: { comune: "No", nobiliare: "Purtroppo no", aulico: "Ahimè, non è dato" },
    zh: { comune: "不", nobiliare: "并非", aulico: "断然不可" },
  },
  {
    id: "sorry",
    gloss: "sorry / apology",
    it: { comune: "Scusa", nobiliare: "Vi chiedo venia", aulico: "Imploro il vostro perdono" },
    zh: { comune: "对不起", nobiliare: "抱歉", aulico: "万望恕罪" },
  },
  {
    id: "welcome",
    gloss: "welcome",
    it: { comune: "Benvenuto", nobiliare: "Siate il benvenuto", aulico: "Vi si accoglie con onore" },
    zh: { comune: "欢迎", nobiliare: "欢迎光临", aulico: "恭迎大驾" },
  },
  {
    id: "friend",
    gloss: "friend",
    it: { comune: "Amico", nobiliare: "Caro amico", aulico: "Nobile compagno" },
    zh: { comune: "朋友", nobiliare: "友人", aulico: "挚友" },
  },
  {
    id: "love",
    gloss: "love",
    it: { comune: "Amore", nobiliare: "Affetto", aulico: "Ardente passione" },
    zh: { comune: "爱", nobiliare: "爱慕", aulico: "情深意重" },
  },
  {
    id: "house",
    gloss: "house / home",
    it: { comune: "Casa", nobiliare: "Dimora", aulico: "Magione avita" },
    zh: { comune: "家", nobiliare: "府邸", aulico: "宅第" },
  },
  {
    id: "king",
    gloss: "king",
    it: { comune: "Re", nobiliare: "Sovrano", aulico: "Augusto monarca" },
    zh: { comune: "国王", nobiliare: "君主", aulico: "圣上" },
  },
  {
    id: "request",
    gloss: "I ask / I request",
    it: { comune: "Chiedo", nobiliare: "Domando cortesemente", aulico: "Umilmente supplico" },
    zh: { comune: "我要", nobiliare: "我请求", aulico: "在下恳求" },
  },
  {
    id: "understand",
    gloss: "I understand",
    it: { comune: "Capisco", nobiliare: "Comprendo", aulico: "Ben rilevo il vostro intento" },
    zh: { comune: "我明白", nobiliare: "我理解", aulico: "在下已然领会" },
  },
  {
    id: "beautiful",
    gloss: "beautiful",
    it: { comune: "Bello", nobiliare: "Leggiadro", aulico: "Di sublime avvenenza" },
    zh: { comune: "美", nobiliare: "美丽", aulico: "绝美" },
  },
  {
    id: "help",
    gloss: "help",
    it: { comune: "Aiuto", nobiliare: "Assistenza", aulico: "Soccorso" },
    zh: { comune: "帮助", nobiliare: "协助", aulico: "援手" },
  },
  {
    id: "water",
    gloss: "water",
    it: { comune: "Acqua", nobiliare: "Bevanda", aulico: "Linfa cristallina" },
    zh: { comune: "水", nobiliare: "清水", aulico: "甘泉" },
  },
  {
    id: "congratulations",
    gloss: "congratulations",
    it: { comune: "Congratulazioni", nobiliare: "Le mie felicitazioni", aulico: "I miei più fervidi auguri" },
    zh: { comune: "恭喜", nobiliare: "祝贺", aulico: "谨致贺忱" },
  },
];
