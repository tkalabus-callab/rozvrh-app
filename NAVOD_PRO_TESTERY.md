# Rozvrh app - návod pro testery

Tento návod slouží pro první testování aplikace Rozvrh app.

Testovací verze je připravená jako čistá aplikace bez dat. Každý tester si vytvoří vlastní testovací školy, školníky, trenéry a rozvrhy. Data se ukládají pouze v jeho prohlížeči a neovlivní data ostatních testerů ani hlavní pracovní verzi.

## Co dostanete na Nextcloudu

Ve sdílené složce budou dva soubory:

- ZIP soubor s aplikací, například `Rozvrh-app-test-cista-verze.zip`.
- Tento návod ve formátu PDF.

ZIP soubor nespouštějte přímo v náhledu Nextcloudu. Vždy jej nejprve stáhněte a rozbalte do svého počítače.

## Instalace a spuštění

1. Stáhněte ZIP soubor z Nextcloudu.
2. ZIP rozbalte do vlastního počítače, například na plochu nebo do dokumentů.
3. Otevřete rozbalenou složku.
4. Dvakrát klikněte na soubor `SPUSTIT.bat`.
5. Otevře se okno lokálního serveru a zároveň prohlížeč s aplikací.
6. Okno lokálního serveru nezavírejte. Musí zůstat otevřené po celou dobu práce s aplikací.

Pokud zavřete okno lokálního serveru, aplikace se vypne. V takovém případě znovu klikněte na `SPUSTIT.bat`.

## Co nespouštět ručně

Ručně neotevírejte tyto soubory:

- `home.html`
- `index.html`
- `Start-Rozvrh.ps1`
- soubory `.js`
- soubory `.css`

Tester spouští pouze soubor `SPUSTIT.bat`.

Soubor `Start-Rozvrh.ps1` je technická součást aplikace. Slouží k tomu, aby se aplikace správně otevřela v prohlížeči. Není určený k ručnímu otevírání.

## Přihlášení

Testovací heslo je:

`1111`

V aplikaci jsou dvě role:

- Školník: vidí jen školy, které mu přiřadil manažer.
- Manažer: vidí všechny části aplikace a všechny školy.

Po přihlášení se pouze odemknou karty na rozcestníku. Aplikace vás nemá sama přesměrovat do rozvrhu.

## Čistá testovací data

Testovací aplikace neobsahuje žádná výchozí data.

To znamená:

- založíte si vlastní školníky,
- založíte si vlastní školy,
- založíte si vlastní trenéry,
- vytvoříte vlastní školní rozvrhy,
- doplníte vlastní skutečnost,
- vyzkoušíte vlastní výkazy.

Nepoužívejte import dat, pokud k tomu nedostanete zvláštní pokyn.

## Jak začít znovu s čistou verzí

Pokud se testovací aplikace rozbije nebo chcete začít úplně od začátku:

1. Zavřete okno lokálního serveru.
2. Zavřete prohlížeč s aplikací.
3. Smažte rozbalenou složku s aplikací.
4. Znovu stáhněte ZIP z Nextcloudu.
5. ZIP znovu rozbalte.
6. Spusťte `SPUSTIT.bat`.

Pozor: data se ukládají v prohlížeči. Pokud chcete opravdu úplně čistý začátek ve stejném prohlížeči, může být potřeba vymazat data webu pro adresu `127.0.0.1`. Pokud si nejste jistí, napište správci testování.

## Co testovat

Základní oblasti testování:

1. Přihlášení školníka a manažera.
2. Zakládání školníků.
3. Zakládání škol.
4. Přiřazení škol školníkům.
5. Zakládání trenérů.
6. Zadání školního týdenního rozvrhu.
7. Doplnění rozvrhu do pracovního týdne.
8. Doplnění skutečnosti.
9. Uzavření týdne.
10. Kontrola práce.
11. Výkazy.
12. Export PDF a Excel.
13. Archiv výkazů.

Podrobnější testovací checklist je v souboru `TESTOVANI.md`, který je součástí rozbalené složky.

## Co hlásit při chybě

Při chybě prosím napište:

- kdo byl přihlášený: manažer nebo konkrétní školník,
- na jaké stránce chyba nastala,
- jaká škola, trenér, měsíc nebo týden se testoval,
- co jste udělali,
- co se stalo,
- co jste čekali, že se stane,
- ideálně přiložte screenshot.

## Nejčastější problémy

### Po kliknutí na SPUSTIT.bat se nic neotevře

Zkontrolujte, zda jste ZIP nejprve rozbalili. Aplikace se nemá spouštět přímo ze ZIPu.

### Otevřel se soubor jako text

Pravděpodobně byl otevřen špatný soubor. Zavřete ho a spusťte pouze `SPUSTIT.bat`.

### Prohlížeč ukazuje adresu 127.0.0.1

To je v pořádku. Aplikace běží lokálně na vašem počítači.

### Windows zobrazí bezpečnostní upozornění

U některých počítačů může Windows nebo firemní ochrana upozornit na spouštění staženého souboru. Pokud si nejste jistí, kontaktujte správce testování.

### Aplikace se po zavření okna serveru přestala načítat

To je správné chování. Znovu spusťte `SPUSTIT.bat`.

## Důležitá poznámka

Tato testovací verze je určená hlavně pro počítače s Windows.

Telefon a tablet zatím nejsou hlavní testovací prostředí pro editaci. Pro iPhone a iPad bude vhodnější samostatný čtecí náhled rozvrhu, který připravíme později.
