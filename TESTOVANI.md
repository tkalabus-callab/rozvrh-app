# Pokyny pro testovani

## Spusteni

Otevrit soubor `home.html`. Na jednotlive karty nechodit primo pres `index.html`, protoze vstup ma hlidat rozcestnik.

## Prihlaseni

Heslo pro testovani je zatim `1111`.

- Skolnik: po prihlaseni vidi jen skoly, ktere mu priradil manazer.
- Manazer: po prihlaseni vidi vsechny casti aplikace a vsechny skoly.

## Prenos dat

Po prihlaseni jako manazer se na rozcestniku zobrazi box `Zaloha dat`.

- `Exportovat data` stahne jeden `.json` soubor se vsemi daty aplikace.
- `Importovat data` prepise data v aktualnim prohlizeci daty ze zalohy.
- Import pouzivat jen po domluve, protoze prepise lokalni data v danem prohlizeci.

## Co otestovat

1. Prihlaseni bez hesla nepusti do karet Rozvrh, Skoly, Treneri, Vykazy.
2. Skolnik po prihlaseni vidi v rozvrhu jen svoje prirazene skoly.
3. Manazer muze ve skolach prirazovat skoly skolnikum.
4. Ve skole jde zadat tydenni rozvrh hodin a vyjimky.
5. V rozvrhu jde doplnit tyden ze skolniho rozvrhu, upravit skutecnost a ulozit/nacist archiv rozvrhu.
6. Ve vykazech se hodiny nacitaji ze skutecnosti a soucty skol/treneru sedi.
7. Export PDF a Excel odpovida aktualne zobrazenemu vykazu.
8. Archiv vykazu drzi za mesic jen posledni verzi pro konkretni skolu nebo trenera.
9. Stav archivu jde oznacit jako Vyfakturovano nebo Zkontrolovano.

## Poznamky

Tlacitka pro hromadne mazani archivu nejsou v testovaci verzi viditelna. Testovaci data nemazat bez domluvy.
