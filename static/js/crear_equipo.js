document.addEventListener("DOMContentLoaded", () => {
    
    // --- Lógica para previsualizar la imagen ---
    const fileInput = document.getElementById('foto-input');
    const imageBox = document.getElementById('image-preview-container');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageBox.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">`;
                imageBox.style.border = "none";
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Lógica para agregar integrantes a la lista visual ---
    const btnAddMember = document.getElementById('btn-add-member');
    const memberInput = document.getElementById('member-input');
    const membersContainer = document.getElementById('members-container');
    let userCounter = 1; // Ya hay 1 en el HTML

    btnAddMember.addEventListener('click', () => {
        const nameValue = memberInput.value.trim();
        if (nameValue !== '') {
            userCounter++;
            
            const rowDiv = document.createElement('div');
            rowDiv.className = 'member-row';
            
            rowDiv.innerHTML = `
                <span class="material-symbols-outlined icon-star">stars</span>
                <div class="member-data">
                    <span class="m-role">Usuario ${userCounter}</span>
                    <span class="m-name">${nameValue}</span>
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
                    <span class="material-symbols-outlined">arrow_right</span>
                </button>
            `;
            
            membersContainer.appendChild(rowDiv);
            memberInput.value = ''; // Limpiar el input después de agregar
        }
    });
});