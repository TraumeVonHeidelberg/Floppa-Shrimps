Aplikacja działa zarówno w środowisku webowym jak i aplikacja desktopowa.

Uruchomienie jej jako aplikacji webowej wymaga uprzedniego uruchomienia serwera na pomocą komendy node app.js

Uruchomienie jako aplikacji desktopowej odbywa się za pomocą frameworka electron. Można to zrealizować za pomocą komendy electron . lub electron main.js
Polecenie to automatycznie uruchomi serwer.

Aplikacja ta stara się realizować wszelkie potencjalne potrzeby restauracji poprzez realizacje następujących funkcji:

1. Bogaty FrontEnd, który pozwala klientowi zapoznać się z ofertą restauracji i zachęcić do jej odwiedzenia. Design aplikacji jest bogaty i przemyślany
   wyróżniając elementy szczególnie interesujące klienta oraz celując w zapewnienie dobrego imienia marki. Warte wyróżnienia od strony UI/UX są chociażby logo
   aplikacji, które wykonałem samodzielnie w programie adobe ilustrator, które w sposób szczególny wyróżnia stworzoną przeze mnie markę. Panel do rezerwacji
   jest prosty w użyciu i intuicyjny, wyróżniony poprzez dodatkowe elementy wizualne by zapewnić że zarówno stały klient jak i nowy będą mogli go łatwo odnaleźć.
   Zaraz po otwarciu aplikacji użytkowników wita logo, nawigacja i panel przedstawiający wszelkie najważniejsze informacje. Dodatkowy lineart (również mojego
   autorstwa) wyróżnia przy tym aplikacje jeszcze bardziej. Zaraz poniżej znajdują się zdjęcia (pobrane z darmowych baz nie objętych licencją) przykładowych
   potraw w celu zachęcenia gości do odwiedzenia. Reszta elementów stopniowo przeprowadza użytkownika przez wszelkie istotne informacje zapewniając unikalny
   design na każdym etapie. Posiadam również wiele skryptów stricte frontendowych co wyróżnia moją aplikację, chociażby data w stopce będzie zawsze aktualna, pojawiający się kolor dla nawigacji, offset dla linków w nawigacji itd.
2. Wyjątkowo rozbudowany backend. Aplikacja działa na bazie danych składającej się z ośmiu tabel (widocznych na dołączonym schemacie). Każda z tabel
   posiada konieczne ograniczenia, powiązania, triggery i indexy zgodnie z wymaganiami tam gdzie uznałem to za stosowne. Dodatkowo powiązania między tabelami można zobaczyć w associations.js. Poszedłem jednak o krok dalej w
   mojej pracy z bazą danych umożliwiając użytkownikom (a w szczególności adminowi) interakcję z nią bez wykonywania żadnych zapytań sql. Niemalże każdy
   element który zarządzany jest przez baze danych może być edytowany, usuwany, dodawany z poziomu przystępnego interfejsu graficznego, dodatkowo zapewniając
   walidacje tych danych na każdym etapie. Nawet gdyby admin usunął wszystkie tabele z bazy zostaną one automatycznie odbudowane w tym scenariuszu po uruchomieniu serwera. Edycja poszczególnych kolumn chociażby ich ograniczeń, typów danych to również kwestia edycji jednej linijki w modelach i uruchomienia opcji alter:"true" w sync w pliku app.js (bądź force w bardziej skrajnych przypadkach). Wszystkie zapytania dziejące się w bazie danych wyświetlane są w terminalu.
   Warto wspomnieć że samo sequelize dba w dużej mierze o bezpieczeństwo bazy danych chociażby poprzez użycie ORM, a ja wzmacniam to dodatkowo m.in. express-validator i weryfikacją tokenów JWT. Admin więc może łatwo zarządzać pozycjami menu, opiniami użytkowników,
   newsami na stronie i rezerwacjami. Zwykły użytkownik może zapoznawać się ze swoimi rezerwacjami i edytować swój profil. Każda z tych opcji posiada rozbudowane
   podopcje chociażby zmiana hasła wiąże się z koniecznością wypełnienia dodatkowego formularza, zmiana e-maila wymaga jego potwierdzenia poprzez kliknięcie w link
   otrzymany na skrzynkę, dokonanie rezerwacji i jej anulowanie wiąże się z otrzymaniem powiadomienia e-mail itd.
   Użytkownik może ustalić swój pseudonim na profilu, dzięki czemu może pisać komentarze pod newsami nie pod swoim imieniem i nazwiskiem.
   Formularz rezerwacji ma inną postać zarówno dla zalogowanych jak i niezalogowanych użytkoników, ułatwiając proces dla tych zalogowanych i zachęcając innych do
   zostania częścią społeczności. Formularz rezerwacji zawiera złożoną walidację, na tym poziomie zawsze sprawdzane jest czy dana rezerwacja jest możliwa.
   Formularz dostosowany jest do godzin otwarcia restauracji, nie można rezerwować na czas wcześniejszy niż obecny, dostępne stoliki są cały czas weryfikowane.
   Takich funkcji i zależności jest zaś dużo więcej, bo starałem się uczynić aplikacje jak najbardziej kompleksową.
   Dodatkowo kod posiada wszelkie konieczne logowania błędów i komentarze.

   Nie napisałem skryptów tworzących baze danych, ponieważ wszystko odbywa się przez sequelize, a na konsoli dynamicznie logowane są wszystkie operacje na bazie danych.
   Zrobiłem też zadanie dodatkowe z moodle i można to potraktować jako plus.
