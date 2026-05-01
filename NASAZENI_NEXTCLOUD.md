# Nasazeni testovani pres Nextcloud

## Cil

Kolegum nedavat primy zapisovy pristup do slozky `Rozvrh app`.

Nextcloud pouzit jako misto, odkud si tester vezme testovaci verzi aplikace a pripadne testovaci data. Tester tak nemuze omylem prepsat nebo smazat zdrojove soubory.

## Doporuceny postup pro aktualni testovani

### 1. Pripravit testovaci balicek

Vytvorit ZIP archiv cele slozky aplikace, napriklad:

`Rozvrh-app-test-2026-05-01.zip`

Do ZIP patri:

- `home.html`
- `index.html`
- `schools.html`
- `trainers.html`
- `caretakers.html`
- `vykazy.html`
- `kontrola.html`
- `nahled.html`
- `trainer-plan.html`
- `trainer-plan.js`
- `styles.css`
- `texts.js`
- `SPUSTIT.bat`
- `Start-Rozvrh.ps1`
- `TESTOVANI.md`

Do ZIP nepatri:

- slozka `.git`
- pracovni poznamky, ktere nemaji videt testeri
- zalohy nebo osobni soubory

### 2. Nahrat ZIP na Nextcloud

Na Nextcloudu zalozit slozku napr.:

`Rozvrh app - testovani`

Do ni nahrat:

- ZIP s aplikaci,
- `TESTOVANI.md`.

Nenahravat zadny `.json` export dat. Testeri zacinaji s prazdnou aplikaci.

### 3. Nastavit prava jen pro cteni

Sdilet slozku nebo soubory kolegum tak, aby meli jen:

- zobrazit,
- stahnout.

Nedavat prava:

- upravovat,
- mazat,
- vytvaret soubory,
- presouvat soubory.

### 4. Jak bude testovat kolega na pocitaci

Tester:

1. Stahne ZIP z Nextcloudu.
2. Rozbali si ho k sobe do pocitace.
3. Dvakrat klikne na `SPUSTIT.bat`.
4. Otevre se prohlizec s aplikaci.
5. Prihlasi se heslem `1111`.

Okno, ktere se po spusteni otevre, musi zustat otevrene po celou dobu prace s aplikaci. Zavrenim tohoto okna se lokalni testovaci server vypne.

Tento postup je bezpecny, protoze tester pracuje s vlastni kopii aplikace a nemuze poskodit zdrojovou verzi v Nextcloudu.

## Dulezite omezeni soucasne verze

Soucasna aplikace uklada data do prohlizece konkretniho zarizeni.

To znamena:

- kazdy tester ma vlastni data,
- pocitac, tablet a telefon mezi sebou automaticky nesdili stejna data,
- pokud chce tester stejna data na jinem zarizeni, musi pouzit export/import dat.

Pro spolecna ziva data pro vsechny uzivatele bude pozdeji potreba serverove uloziste.

## Tablet a iPhone

Pro iPad/iPhone je vhodne zacit jen ctecim rezimem.

Doporuceny cil:

- samostatna stranka pro nahled rozvrhu,
- bez editacnich tlacitek,
- bez skol, treneru, vykazu a archivu,
- jen zobrazeni planu/rozvrhu.

Poznamka: pokud se ma na iPhonu zobrazovat stejny aktualni rozvrh jako na pocitaci, bude potreba vyresit spolecne uloziste dat. Jen samotny Nextcloud soubor to v soucasne lokalni verzi aplikace nevyresi.

## Co nedelat

- Nedavat kolegum zapisovy pristup do pracovni slozky `Rozvrh app`.
- Nepoustet testery do `.html`, `.js`, `.css` souboru pres sdilenou editovatelnou slozku.
- Nespolihat na to, ze otevreni `home.html` primo v nahledu Nextcloudu nebo dvojklikem bude fungovat jako plnohodnotna webova aplikace. Bezpecnejsi je stazeni ZIPu, rozbaleni a spusteni pres `SPUSTIT.bat`.

## Pozdejsi produkcni varianta

Az budeme chtit, aby vsichni pracovali nad stejnymi daty, bude potreba jedna z variant:

1. jednoduche serverove uloziste dat,
2. databaze,
3. API mezi aplikaci a serverem,
4. cteci mobilni nahled napojeny na stejna data.

Nextcloud muze zustat mistem pro distribuci, zalohy a dokumentaci, ale pro ziva sdilena data bude lepsi samostatne uloziste.
