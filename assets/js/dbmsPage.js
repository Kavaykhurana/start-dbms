document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.copy-code').forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.dataset.copyTarget);

            if (!target) {
                return;
            }

            await navigator.clipboard.writeText(target.textContent);
            const originalText = button.textContent;
            button.textContent = 'Copied';

            window.setTimeout(() => {
                button.textContent = originalText;
            }, 1400);
        });
    });
});
