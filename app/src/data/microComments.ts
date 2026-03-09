const specificComments: Record<string, Record<string, string>> = {
  'P2.1': {
    Nie: "Bez API konwersji system reklamowy Meta zwykle nie widzi pełnego obrazu sprzedaży. To częsty punkt, który warto domknąć.",
    'Nie wiem co to jest':
      'To połączenie Twojego serwera z Meta, które uzupełnia utracone dane o konwersjach. W praktyce często poprawia jakość optymalizacji kampanii.',
  },
  'P3.2': {
    'Nie wiem co to jest':
      'CSS w Google Merchant Center może obniżyć koszt kliknięć w Shopping nawet o 20%. To szybki obszar optymalizacji, który często poprawia rentowność kampanii.',
  },
  'P4.1': {
    'ROAS — zwrot z wydatków na reklamy (przychód / wydatki)':
      'ROAS to dobry punkt startowy, ale nie pokazuje realnego zysku. W kolejnym kroku warto dołożyć perspektywę marży.',
    'Nie wiem czym się różnią':
      'To częsty przypadek. W praktyce sama różnica między przychodem a zyskiem bardzo wpływa na decyzje reklamowe.',
  },
  'P1.4a': {
    'Nie mierzę LTV':
      'Bez LTV trudno ustalić, ile opłaca się zapłacić za pozyskanie klienta. To jeden z kluczowych wskaźników przy skalowaniu.',
    'Mniej więcej wiem, ile wraca':
      'To dobry punkt startowy, ale warto przejść z orientacji na liczby. Gdy liczysz LTV regularnie, łatwiej bezpiecznie skalować budżet.',
  },
  'P1.5': {
    'Nie liczę tego':
      'Bez znajomości CAC trudno ocenić, czy reklamy zarabiają czy tylko generują obrót. To ważny fundament decyzji.',
    'Nie wiem co to jest CAC':
      'CAC to koszt pozyskania jednego klienta. Znając ten wskaźnik, łatwiej kontrolować rentowność działań reklamowych.',
  },
  'P7.2': {
    'Nie — skupiam się na bieżącej sprzedaży':
      'To tzw. 5 sił Portera: model, który pomaga ocenić czynniki zewnętrzne wpływające na rentowność. Warto znać ten kontekst strategiczny.',
    'Słyszałem/am o tym, ale nie analizuję formalnie':
      'Nawet prosty przegląd 5 sił Portera pomaga wcześniej wykrywać ryzyka i okazje rynkowe.',
  },
  'P4.4': {
    'Tak — to moja codzienność':
      'To sygnał, że optymalizacja idzie bardziej pod wskaźniki w panelu niż pod zysk. Warto połączyć decyzje reklamowe z marżą i pełnym kosztem pozyskania.',
    Czasami:
      'To często pierwszy objaw rozjazdu między panelem reklam a realną rentownością. Warto regularnie zestawiać wyniki kampanii z marżą i kosztami stałymi.',
  },
  'P2.3': {
    'Mam, ale rzadko zaglądam':
      'Sama instalacja GA4 to dopiero początek. Największą wartość daje regularna analiza ścieżki zakupu i miejsc, gdzie użytkownicy odpadają.',
  },
  'P6.3': {
    'Mam domysły, ale nie analizowałem/am dokładnie':
      'Intuicja pomaga, ale dopiero twarde dane pokazują, gdzie naprawdę tracisz sprzedaż. Warto regularnie analizować przyczyny porzuceń koszyka.',
  },
  'P3.6': {
    Nie:
      'To dobry obszar wzrostu zysku. Lepsze dopasowanie tytułu do zapytań często obniża koszt kliknięcia, podnosi CTR i w efekcie zmniejsza koszt reklamy, a czasem decyduje też o samym pojawieniu się produktu w wynikach.',
    'Nie wiem że można tak robić':
      'To dobry obszar wzrostu zysku. Lepsze dopasowanie tytułu do zapytań często obniża koszt kliknięcia, podnosi CTR i w efekcie zmniejsza koszt reklamy, a czasem decyduje też o samym pojawieniu się produktu w wynikach.',
  },
  'P4.2': {
    'Tak — dokładnie wiem':
      'To mocna przewaga decyzyjna. Dzięki temu łatwiej przesuwać budżet w stronę produktów, które realnie budują zysk, a nie tylko obrót.',
  },
}

export function getMicroComment(questionId: string, answerLabel: string): string | null {
  const byQuestion = specificComments[questionId]
  if (byQuestion?.[answerLabel]) {
    return byQuestion[answerLabel]
  }

  const lower = answerLabel.toLowerCase()
  if (lower.startsWith('nie') || lower.includes('nie wiem')) {
    return 'To częsty obszar luki w e-commerce. Dobrze, że to wychwyciliśmy - warto do niego wrócić w priorytetach raportu.'
  }
  const problematicPositiveSignals = ['codzienność', 'nie czujesz', 'problem', 'rozjazd', 'kłopot']
  if (problematicPositiveSignals.some((token) => lower.includes(token))) {
    return 'To jest pole do optymalizacji, bo taki rozjazd zwykle oznacza, że panel reklam nie jest jeszcze spięty z realną rentownością.'
  }
  if (lower.startsWith('tak') || lower.includes('aktywnie')) {
    return 'To wzmacnia fundament działań i ułatwia podejmowanie lepszych decyzji przy skalowaniu.'
  }
  return null
}
