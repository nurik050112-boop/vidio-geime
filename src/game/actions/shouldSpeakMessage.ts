

export function runShouldSpeakMessage(text: string): boolean {
    if (text.length < 18) return false;
    if (/HP|Удар по|Монстр напал сам|Осталось монстров|Получено золото/i.test(text)) return false;
    return /Концовка|Телепорт|Код|Появился|появился|побежден|побеждены|очищен|очищена|вошел|вышел|выбор|Получен|Получена|куплен|Продано|Продана|началась|начинается|открыл|открыта|ядерка/i.test(text);
  
}
