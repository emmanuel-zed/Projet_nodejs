// SAVEURS CI - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Socket.IO connection for real-time notifications
  if (typeof io !== 'undefined') {
    const socket = io();

    // Get user ID from page if available
    const userMeta = document.querySelector('meta[name="user-id"]');
    if (userMeta) {
      socket.emit('join', { userId: userMeta.content });
    }

    // Listen for notifications
    socket.on('notification', function(data) {
      showNotification(data.message, data.type);
    });

    // Listen for order status updates
    socket.on('statutCommande', function(data) {
      showNotification(
        'Commande #' + data.numero + ' : ' + data.statut.replace(/_/g, ' '),
        'commande'
      );
    });
  }

  // Notification display
  function showNotification(message, type) {
    const container = getOrCreateToastContainer();

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-header bg-primary text-white">
        <i class="fas fa-bell me-2"></i>
        <strong class="me-auto">Saveurs CI</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 300);
    }, 5000);

    // Close button
    toast.querySelector('.btn-close').addEventListener('click', function() {
      toast.remove();
    });
  }

  function getOrCreateToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Image preview for file inputs
  document.querySelectorAll('input[type="file"][accept*="image"]').forEach(function(input) {
    input.addEventListener('change', function(e) {
      const preview = this.parentElement.querySelector('.img-preview');
      if (preview && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          preview.src = ev.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });

  // Form confirmation for delete actions
  document.querySelectorAll('form[data-confirm]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!confirm(this.dataset.confirm)) {
        e.preventDefault();
      }
    });
  });
});
