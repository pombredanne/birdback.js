birdback.js
===========

Client side javascript library to use Birdback API wihtout being PCI compliant.


Encrypt a card number
---------------------

    <body>
        <form>
            <input name="cardnumber" required data-encrypt />
        </form>
        <script type="text/javascript">
            document.addEventListener('DOMContentLoaded, function () {
                var birdback = new Birdback('<yourpublickey>');
            });
        </script>
    </body>


Validate card number
--------------------

    var numberInput = document.querySelector('[name=cardnumber]');
    numberInput.addEventListener('input', function (e) {
        var value = numberInput.value;
        if (Birdback.luhn.validate(value)) {
            numberInput.setCustomValidity('');
        } else {
            numberInput.setCustomValidity('Invalid card number');
        }
    });


Running the test suite
----------------------

The test suite can be launched in browser:

    <browser_executable> tests/static/index.html

or within a Python environment with dependencies installed using ``pip``:

    pip install -r tests/requirements.txt
    make test
