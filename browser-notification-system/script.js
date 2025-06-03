document.addEventListener('DOMContentLoaded', () => {
    const permissionStatusElement = document.getElementById('permissionStatus');
    const requestPermissionBtn = document.getElementById('requestPermission');
    const sendNotificationBtn = document.getElementById('sendNotification');
    const clearLogBtn = document.getElementById('clearLog');
    const notificationLog = document.getElementById('notificationLog');
    
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationBody = document.getElementById('notificationBody');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationDelay = document.getElementById('notificationDelay');
    const requireInteraction = document.getElementById('requireInteraction');
    const includeActions = document.getElementById('includeActions');
    
    const demoMessageBtn = document.getElementById('demoMessage');
    const demoReminderBtn = document.getElementById('demoReminder');
    const demoUpdateBtn = document.getElementById('demoUpdate');
    const demoErrorBtn = document.getElementById('demoError');
    
    const notificationPreview = document.getElementById('notificationPreview');
    const previewIcon = document.getElementById('previewIcon');
    const previewTitle = document.getElementById('previewTitle');
    const previewBody = document.getElementById('previewBody');
    const previewActions = document.getElementById('previewActions');
    
    let notificationHistory = JSON.parse(localStorage.getItem('notificationHistory')) || [];
    
    function checkNotificationSupport() {
        if (!('Notification' in window)) {
            permissionStatusElement.textContent = 'Not supported in this browser';
            permissionStatusElement.className = 'status-denied';
            disableControls();
            return false;
        }
        return true;
    }
    
    function updatePermissionStatus() {
        if (!checkNotificationSupport()) return;
        
        const permission = Notification.permission;
        
        permissionStatusElement.textContent = permission;
        permissionStatusElement.className = `status-${permission}`;
        
        if (permission === 'granted') {
            requestPermissionBtn.textContent = 'Permission Granted';
            requestPermissionBtn.disabled = true;
            enableControls();
        } else if (permission === 'denied') {
            requestPermissionBtn.textContent = 'Permission Denied (Check Browser Settings)';
            requestPermissionBtn.disabled = true;
            disableControls();
        } else {
            requestPermissionBtn.textContent = 'Request Permission';
            requestPermissionBtn.disabled = false;
            disableControls();
        }
    }
    
    function requestNotificationPermission() {
        if (!checkNotificationSupport()) return;
        
        Notification.requestPermission()
            .then(permission => {
                updatePermissionStatus();
                
                if (permission === 'granted') {
                    sendWelcomeNotification();
                }
            })
            .catch(error => {
                console.error('Error requesting notification permission:', error);
                alert('There was an error requesting permission. Please try again.');
            });
    }
    
    function sendWelcomeNotification() {
        sendNotification({
            title: 'Notifications Enabled!',
            body: 'You will now receive notifications from this application.',
            icon: 'success',
            requireInteraction: false,
            actions: []
        });
    }
    
    function sendNotification(options) {
        if (Notification.permission !== 'granted') {
            alert('Notification permission is not granted.');
            return;
        }
        
        try {
            // Create notification without actions (they require Service Worker Registration)
            const notification = new Notification(options.title, {
                body: options.body,
                icon: getIconPath(options.icon),
                requireInteraction: options.requireInteraction
                // actions removed as they require ServiceWorkerRegistration.showNotification()
            });
            
            notification.onclick = function() {
                window.focus();
                notification.close();
                logNotificationInteraction(options.title, 'clicked');
            };
            
            notification.onclose = function() {
                logNotificationInteraction(options.title, 'closed');
            };
            
            // Add to log and show in preview
            addToNotificationLog(options);
            
            // If actions were specified, show info about Service Worker requirement
            if (options.actions && options.actions.length > 0) {
                const existingNotes = document.querySelectorAll('.action-note');
                existingNotes.forEach(note => note.remove());
                
                const actionNote = document.createElement('div');
                actionNote.className = 'compatibility-notice action-note';
                actionNote.innerHTML = '<strong>Note:</strong> Action buttons are only displayed in the preview. They require Service Worker Registration to function in actual notifications.';
                
                // Add the note after the form
                const form = document.getElementById('notificationForm');
                form.parentNode.insertBefore(actionNote, form.nextSibling);
                
                // Auto-remove after 8 seconds
                setTimeout(() => {
                    actionNote.style.opacity = '0';
                    setTimeout(() => actionNote.remove(), 500);
                }, 8000);
            }
            
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('There was an error creating the notification: ' + error.message);
        }
    }
    
    function addToNotificationLog(options) {
        const logEntry = {
            title: options.title,
            body: options.body,
            icon: options.icon,
            timestamp: new Date().toISOString(),
            requireInteraction: options.requireInteraction,
            hasActions: options.actions && options.actions.length > 0
        };
        
        notificationHistory.unshift(logEntry);
        
        if (notificationHistory.length > 20) {
            notificationHistory = notificationHistory.slice(0, 20);
        }
        
        localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
        
        updateNotificationLog();
    }
    
    function logNotificationInteraction(title, action) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <div class="log-content">
                <div class="log-title">${title} - ${action}</div>
                <div class="log-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        notificationLog.insertBefore(logEntry, notificationLog.firstChild);
        
        if (notificationLog.querySelector('.empty-log')) {
            notificationLog.querySelector('.empty-log').remove();
        }
    }
    
    function updateNotificationLog() {
        notificationLog.innerHTML = '';
        
        if (notificationHistory.length === 0) {
            notificationLog.innerHTML = '<p class="empty-log">No notifications sent yet.</p>';
            return;
        }
        
        notificationHistory.forEach(entry => {
            const formattedTime = new Date(entry.timestamp).toLocaleString();
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <div class="log-icon">
                    <svg class="icon-svg ${entry.icon}" viewBox="0 0 24 24">
                        <path d="${getIconPath(entry.icon)}"></path>
                    </svg>
                </div>
                <div class="log-content">
                    <div class="log-title">${entry.title}</div>
                    <div class="log-body">${entry.body}</div>
                    <div class="log-time">${formattedTime}</div>
                </div>
            `;
            
            notificationLog.appendChild(logEntry);
        });
    }
    
    function getIconPath(iconType) {
        const iconMap = {
            'info': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwNzFlMyIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTEgMTVoLTJWOWgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=',
            'success': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzM0Yzc1OSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0yIDE1bC01LTUgMS40MS0xLjQxTDEwIDE0LjE3bDcuNTktNy41OUwxOSA4bC05IDl6Ii8+PC9zdmc+',
            'warning': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmOTUwMCIgZD0iTTEgMjFoMjJMMTIgMiAxIDIxem0xMi0zaC0ydi0yaDJ2MnptMC00aC0yVjEwaDJ2NHoiLz48L3N2Zz4=',
            'error': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmM2IzMCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTEgMTVoLTJ2LTJoMnYyem0wLTRoLTJWN2gydjZ6Ii8+PC9zdmc+'
        };
        
        // Return the icon URL if it exists in the map, otherwise return the info icon
        return iconMap[iconType] || iconMap['info'];
    }
    
    function enableControls() {
        sendNotificationBtn.disabled = false;
        notificationTitle.disabled = false;
        notificationBody.disabled = false;
        notificationIcon.disabled = false;
        notificationDelay.disabled = false;
        requireInteraction.disabled = false;
        includeActions.disabled = false;
        
        demoMessageBtn.disabled = false;
        demoReminderBtn.disabled = false;
        demoUpdateBtn.disabled = false;
        demoErrorBtn.disabled = false;
    }
    
    function disableControls() {
        sendNotificationBtn.disabled = true;
        notificationTitle.disabled = true;
        notificationBody.disabled = true;
        notificationIcon.disabled = true;
        notificationDelay.disabled = true;
        requireInteraction.disabled = true;
        includeActions.disabled = true;
        
        demoMessageBtn.disabled = true;
        demoReminderBtn.disabled = true;
        demoUpdateBtn.disabled = true;
        demoErrorBtn.disabled = true;
    }
    
    function updatePreview() {
        const title = notificationTitle.value;
        const body = notificationBody.value;
        const icon = notificationIcon.value;
        const showActions = includeActions.checked;
        
        previewTitle.textContent = title;
        previewBody.textContent = body;
        previewIcon.setAttribute('data-icon', icon);
        
        if (showActions) {
            previewActions.style.display = 'flex';
        } else {
            previewActions.style.display = 'none';
        }
        
        notificationPreview.classList.add('show');
        
        setTimeout(() => {
            notificationPreview.classList.remove('show');
        }, 3000);
    }
    
    function handleSendNotification() {
        const title = notificationTitle.value || 'Notification Title';
        const body = notificationBody.value || 'This is a notification message.';
        const icon = notificationIcon.value;
        const interaction = requireInteraction.checked;
        const delay = parseInt(notificationDelay.value) || 0;
        
        // Actions are only shown in preview, not in actual notification
        const showActions = includeActions.checked;
        const actions = showActions ? [
            { action: 'action1', title: 'Action 1' },
            { action: 'action2', title: 'Action 2' }
        ] : [];
        
        updatePreview();
        
        setTimeout(() => {
            sendNotification({
                title: title,
                body: body,
                icon: icon,
                requireInteraction: interaction,
                actions: actions
            });
        }, delay * 1000);
    }
    
    function handleDemoMessage() {
        sendNotification({
            title: 'New Message',
            body: 'You have received a new message from John Doe.',
            icon: 'info',
            requireInteraction: false,
            actions: [
                { action: 'reply', title: 'Reply' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        });
    }
    
    function handleDemoReminder() {
        sendNotification({
            title: 'Meeting Reminder',
            body: 'Your team meeting starts in 15 minutes.',
            icon: 'warning',
            requireInteraction: true,
            actions: [
                { action: 'join', title: 'Join Now' },
                { action: 'snooze', title: 'Snooze' }
            ]
        });
    }
    
    function handleDemoUpdate() {
        sendNotification({
            title: 'System Update',
            body: 'A new version of the application is available. Click to update now.',
            icon: 'success',
            requireInteraction: false,
            actions: [
                { action: 'update', title: 'Update Now' },
                { action: 'later', title: 'Later' }
            ]
        });
    }
    
    function handleDemoError() {
        sendNotification({
            title: 'Error Alert',
            body: 'There was an error processing your last request. Please try again.',
            icon: 'error',
            requireInteraction: true,
            actions: [
                { action: 'retry', title: 'Retry' },
                { action: 'help', title: 'Get Help' }
            ]
        });
    }
    
    function clearNotificationLog() {
        notificationHistory = [];
        localStorage.removeItem('notificationHistory');
        updateNotificationLog();
    }
    
    requestPermissionBtn.addEventListener('click', requestNotificationPermission);
    sendNotificationBtn.addEventListener('click', handleSendNotification);
    clearLogBtn.addEventListener('click', clearNotificationLog);
    
    demoMessageBtn.addEventListener('click', handleDemoMessage);
    demoReminderBtn.addEventListener('click', handleDemoReminder);
    demoUpdateBtn.addEventListener('click', handleDemoUpdate);
    demoErrorBtn.addEventListener('click', handleDemoError);
    
    notificationTitle.addEventListener('input', () => {
        previewTitle.textContent = notificationTitle.value;
    });
    
    notificationBody.addEventListener('input', () => {
        previewBody.textContent = notificationBody.value;
    });
    
    notificationIcon.addEventListener('change', () => {
        previewIcon.setAttribute('data-icon', notificationIcon.value);
    });
    
    includeActions.addEventListener('change', () => {
        previewActions.style.display = includeActions.checked ? 'flex' : 'none';
    });
    
    updatePermissionStatus();
    updateNotificationLog();
});
