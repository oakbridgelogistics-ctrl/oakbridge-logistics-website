// OakBridge Logistics — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initFooterYear();
  initContactForm();
});

/* Mobile navigation toggle */
function initMobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Footer copyright year */
function initFooterYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* Contact form validation + friendly submit handling */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/contact@oakbridge-logistics.com';
  var status = document.getElementById('form-status');

  var MESSAGES = {
    en: {
      nameRequired: 'Please enter your full name.',
      emailInvalid: 'Please enter a valid email address.',
      phoneInvalid: 'Please enter a valid phone number.',
      messageTooShort: 'Please share a few details so we can help (10+ characters).',
      fixFields: 'Please correct the highlighted fields and try again.',
      sending: 'Sending…',
      successPrefix: 'Thank you, ',
      successSuffix: '. Your message has been received — our team will reach out within one business day.',
      error: 'Something went wrong sending your message. Please try again, or email us directly at contact@oakbridge-logistics.com.'
    },
    es: {
      nameRequired: 'Por favor ingrese su nombre completo.',
      emailInvalid: 'Por favor ingrese un correo electrónico válido.',
      phoneInvalid: 'Por favor ingrese un número de teléfono válido.',
      messageTooShort: 'Por favor comparta más detalles para poder ayudarle (mínimo 10 caracteres).',
      fixFields: 'Por favor corrija los campos resaltados e intente de nuevo.',
      sending: 'Enviando…',
      successPrefix: 'Gracias, ',
      successSuffix: '. Hemos recibido su mensaje — nuestro equipo se comunicará con usted dentro de un día hábil.',
      error: 'Hubo un problema al enviar su mensaje. Por favor intente de nuevo, o escríbanos directamente a contact@oakbridge-logistics.com.'
    }
  };
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var t = MESSAGES[lang] || MESSAGES.en;

  var validators = {
    name: function (v) {
      return v.trim().length >= 2 ? '' : t.nameRequired;
    },
    email: function (v) {
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(v.trim()) ? '' : t.emailInvalid;
    },
    phone: function (v) {
      if (!v.trim()) return ''; // optional field
      var digits = v.replace(/\D/g, '');
      return digits.length >= 10 ? '' : t.phoneInvalid;
    },
    message: function (v) {
      return v.trim().length >= 10 ? '' : t.messageTooShort;
    }
  };

  function showFieldError(field, message) {
    var wrapper = field.closest('.form-field');
    var errorEl = wrapper.querySelector('.error-msg');
    if (message) {
      wrapper.classList.add('invalid');
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateField(field) {
    var validator = validators[field.name];
    if (!validator) return true;
    var message = validator(field.value);
    showFieldError(field, message);
    return !message;
  }

  ['name', 'email', 'phone', 'message'].forEach(function (fieldName) {
    var field = form.elements[fieldName];
    if (!field) return;
    field.addEventListener('blur', function () { validateField(field); });
    field.addEventListener('input', function () {
      if (field.closest('.form-field').classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = true;
    ['name', 'email', 'phone', 'message'].forEach(function (fieldName) {
      var field = form.elements[fieldName];
      if (field && !validateField(field)) isValid = false;
    });

    if (!isValid) {
      status.textContent = t.fixFields;
      status.className = 'form-status visible error';
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var firstName = form.elements['name'].value.trim().split(' ')[0];
    var originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = t.sending;

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          // FormSubmit returns HTTP 200 even when a submission fails or the
          // endpoint still needs one-time activation — the real result is
          // in the JSON body, not the status code.
          if (!response.ok || String(data.success) !== 'true') {
            console.error('FormSubmit rejected the submission:', data && data.message);
            throw new Error(data && data.message ? data.message : 'Form submission failed');
          }
          return data;
        });
      })
      .then(function () {
        status.textContent = t.successPrefix + firstName + t.successSuffix;
        status.className = 'form-status visible success';
        form.reset();
      })
      .catch(function () {
        status.textContent = t.error;
        status.className = 'form-status visible error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
  });
}
