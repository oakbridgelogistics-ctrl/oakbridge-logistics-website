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

  var validators = {
    name: function (v) {
      return v.trim().length >= 2 ? '' : 'Please enter your full name.';
    },
    email: function (v) {
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(v.trim()) ? '' : 'Please enter a valid email address.';
    },
    phone: function (v) {
      if (!v.trim()) return ''; // optional field
      var digits = v.replace(/\D/g, '');
      return digits.length >= 10 ? '' : 'Please enter a valid phone number.';
    },
    message: function (v) {
      return v.trim().length >= 10 ? '' : 'Please share a few details so we can help (10+ characters).';
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
      status.textContent = 'Please correct the highlighted fields and try again.';
      status.className = 'form-status visible error';
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var firstName = form.elements['name'].value.trim().split(' ')[0];
    var originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Form submission failed');
        return response.json();
      })
      .then(function () {
        status.textContent = 'Thank you, ' + firstName +
          '. Your message has been received — our team will reach out within one business day.';
        status.className = 'form-status visible success';
        form.reset();
      })
      .catch(function () {
        status.textContent = 'Something went wrong sending your message. Please try again, or email us directly at contact@oakbridge-logistics.com.';
        status.className = 'form-status visible error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
  });
}
