# Pokyny pro testovani

## Spusteni

Testovaci verze bude dostupna pres Nextcloud jako ZIP balicek.

Tester:

1. Stahne ZIP z Nextcloudu.
2. Rozbali ZIP k sobe do pocitace.
3. Dvakrat klikne na soubor `SPUSTIT.bat`.
4. Otevre se prohlizec s aplikaci.

Nezavirat cerne/modre okno serveru, ktere se pri spusteni otevre. Musi zustat otevrene po celou dobu prace s aplikaci.

Nevstupovat primo pres `home.html`, `index.html`, `schools.html` nebo `vykazy.html`, protoze aplikace se ma spoustet pres `SPUSTIT.bat`.

Zdrojovou slozku v Nextcloudu neupravovat. Tester pracuje jen s vlastni stazenou kopii.

Testovaci balicek neobsahuje zadna vychozi data. Kazdy tester si zaklada vlastni skoly, skolniky, trenery a rozvrhy.

## Prihlaseni

Testovaci heslo je zatim `1111`.

- Skolnik: po prihlaseni vidi jen skoly, ktere mu priradil manazer.
- Manazer: po prihlaseni vidi vsechny casti aplikace a vsechny skoly.
- Po prihlaseni se pouze odemknou karty na rozcestniku. Aplikace nema sama presmerovat do rozvrhu.
- Bez prihlaseni musi klik na jakoukoli kartu zobrazit upozorneni, ze je potreba se nejprve prihlasit.

## Prenos dat

Po prihlaseni jako manazer se na rozcestniku zobrazi box `Zaloha dat`.

- `Exportovat data` stahne jeden `.json` soubor se vsemi daty aplikace.
- `Importovat data` prepise data v aktualnim prohlizeci daty ze zalohy.
- Import pri testovani nepouzivat, pokud k tomu nebude samostatna domluva. Testovaci balicek je bez dat.

## Zakladni tok testovani

1. Prihlasit se jako manazer.
2. Zkontrolovat, ze jsou dostupne karty `Rozvrh`, `Skoly`, `Treneri`, `Skolnici`, `Vykazy`, `Kontrola`, `Nahled`.
3. Prihlasit se jako skolnik.
4. Zkontrolovat, ze skolnik vidi jen svoje prirazene skoly.
5. Odhlasit se a overit, ze karty jsou znovu zamcene.

## Skoly

Otestovat jako manazer:

1. Zalozit novou skolu.
2. Pri nove skole rovnou priradit skolnika.
3. Ulozit sazbu skoly.
4. Zadat vyucovaci hodiny do sloupce `H`, napriklad `7,45-8,30`.
5. Zadat tydenni rozvrh hodin pro skolni rok.
6. Overit, ze pri prepnuti na jiny skolni rok je rozvrh prazdny, pokud nebyl vyplnen.
7. Zadat vyjimku pro celou skolu.
8. Overit, ze vyjimky jsou sbalene a zobrazi se az po kliknuti na `Zobrazit vyjimky`.

Otestovat jako skolnik:

1. Zalozit novou skolu.
2. Overit, ze nova skola se automaticky priradi prihlasenemu skolnikovi.

## Rozvrh

Otestovat:

1. Vybrat skolu a tyden.
2. Kliknout na `Doplnit ze skolniho rozvrhu`.
3. Overit, ze se natahnou vsechny vyplnene bunky ze skolniho rozvrhu.
4. Overit, ze se do sloupce `H` natahnou casy vyucovacich hodin ze skoly.
5. U bunky s planem doplnit skutecnost.
6. Pokud je v jedne hodine naplanovano vice trid, overit, ze lze doplnit stejneho i jineho trenera pro skutecnost.
7. Po doplneni posledni chybejici skutecnosti overit hlasku `TYDEN PRIPRAVEN K ARCHIVACI`.
8. Kliknout na `Uzavrit tyden`.
9. Overit, ze uzavreny tyden je pri listovani oznacen jako uzavreny.
10. Kliknout na `Upravit tento tyden` u uzavreneho tydne a overit varovani `POZOR - ZASAH DO ULOZENEHO TYDNE`.
11. Pokud je mesic dane skoly ve vykazech oznacen jako `Vyfakturovano`, editace uzavreneho tydne v tomto mesici musi byt zablokovana.

## Kontrola

Karta `Kontrola` slouzi jako pracovni checklist.

Otestovat:

1. Manazer vidi vsechny skoly.
2. Skolnik vidi jen svoje prirazene skoly.
3. Souhrny ukazuji:
   - kontrolovane skoly,
   - pripraveno,
   - chybi doplnit,
   - tydny k uzavreni.
4. Skoly s problemem jsou nahore.

## Nahled

Karta `Nahled` je pouze pro cteni. Slouzi pro kontrolu rozvrhu na mensi obrazovce, hlavne na telefonu a tabletu.

Otestovat:

1. Prihlasit se jako skolnik.
2. Otevrit kartu `Nahled`.
3. Overit, ze jsou v nabidce jen skoly prirazene prihlasenemu skolnikovi.
4. Overit, ze na telefonu se rozvrh zobrazuje po jednotlivych dnech.
5. Overit, ze na tabletu se rozvrh zobrazuje jako tydenni tabulka.
6. Overit, ze v nahledu nejsou zadna editacni tlacitka.
5. Skoly bez planu jsou dole a vizualne mene vyrazne.
6. Tlacitko `Doplnit skutecnost` otevre rozvrh na spravne skole a na nejstarsim tydnu, kde chybi skutecnost.
7. Tlacitko `Otevrit skolu` u skoly bez planu otevre rozvrh na spravne skole a na tydnu, do ktereho spada prvni den vybraneho mesice.
8. Tlacitko `Uzavrit tyden` otevre rozvrh na tydnu, ktery je potreba uzavrit.

## Treneri

Otestovat:

1. Zalozit noveho trenera.
2. Upravit sazbu trenera.
3. Otevrit plan trenera z karty `Treneri`.
4. Overit, ze plan trenera zobrazuje konkretni casy vyucovacich hodin, ne jen cisla hodin.
5. Overit export PDF, export Excel a poslani e-mailem.

## Vykazy

Zakladni logika:

- Vykazy se pocitaji ze skutecnosti, ne z planu.
- Sloupec `Hodiny` znamena pocet oducenych hodin, ne cislo vyucovaci hodiny.
- Vyber `Fakturace skol` slouzi pro konkretni skolu a vsechny trenery v danem mesici.
- Vyber `Kontrola trenera` slouzi pro konkretniho trenera a vsechny skoly v danem mesici.
- `Vyhodnoceni obdobi` slouzi pro financni prehled hodin, sazeb, fakturace a nakladu.

Otestovat:

1. Bez vybrane skoly nesmi byt u fakturace skol zadne soucty.
2. Bez vybraneho trenera nesmi byt u kontroly trenera zadne soucty.
3. U skoly se skutecnosti overit, ze se zobrazi spravne zaznamy a celkove hodiny.
4. U trenera se skutecnosti overit, ze se zobrazi vsechny skoly, kde v danem mesici ucil.
5. Soucet skol a soucet treneru musi sedet.
6. Pokud chybi skutecnost, nesmi jit oznacit vykaz skoly jako `Vyfakturovano`.
7. Export Excel a PDF musi odpovidat aktualne zobrazenemu vykazu.
8. Poslat e-mailem musi pripravit aktualne zobrazeny vykaz.

## Archiv vykazu

Aktualni logika:

- Archiv ma slouzit hlavne jako uloziste odkontrolovanych/vyfakturovanych vykazu.
- Stav se meni z hlavniho vykazu, ne primo v archivu.
- Archiv pouze ukazuje, zda je vykaz vyfakturovany nebo zkontrolovany, a umoznuje jej nacist.

Otestovat:

1. Otevrit archiv pres horni volbu `Archiv`.
2. Overit rozdeleni na `Skoly` a `Treneri`.
3. Mesice musi byt sbalene a rozbalit se az kliknutim.
4. U archivniho zaznamu musi byt videt stav:
   - `Vyfakturovano`,
   - `Ceka na fakturaci`,
   - `Zkontrolovano`,
   - `Ceka na kontrolu`.
5. V archivu nesmi byt tlacitko pro zmenu stavu.
6. Tlacitko `Nacist` ma otevrit archivni vykaz do hlavni obrazovky vykazu.
7. Pro konkretni skolu/trenera a mesic ma byt v archivu jen posledni verze vykazu.

## Co hlasit

U kazde chyby napsat:

- kdo byl prihlaseny: manazer nebo konkretni skolnik,
- karta, kde chyba nastala,
- skola, trener, mesic/tyden,
- co tester udelal,
- co se stalo,
- co se melo stat,
- idealne screenshot.

## Poznamky

Testovaci hesla zustavaji `1111`.

Hromadne mazani dat a archivu nepouzivat bez domluvy.
