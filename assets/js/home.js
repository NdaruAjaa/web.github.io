document.addEventListener("DOMContentLoaded", function() {
    let savedName = localStorage.getItem("userName");
    const customerNameDisplay = document.getElementById("customerName"); // Ubah ini untuk menampilkan nama pelanggan
    const logoutBtn = document.querySelector("#logout"); // Jika Anda masih memiliki tombol logout
    const regexName = /^[a-zA-Z0-9_]{3,16}$/;

    // Inisialisasi keranjang
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartIcon = document.getElementById("cartIcon");
    const cartCount = document.getElementById("cartCount");
    const trakteerIframe = document.getElementById("trakteerIframe");

    // Fungsi untuk memperbarui tampilan keranjang (jumlah item)
    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? "block" : "none";
    }

    // Fungsi untuk menyimpan keranjang ke Local Storage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    }

    // Fungsi untuk menambahkan item ke keranjang
    function addToCart(item) {
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item,
                quantity: 1
            });
        }
        saveCart();
    }

    // Fungsi untuk menghapus item dari keranjang
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        saveCart();
    }

    // Fungsi untuk mengubah kuantitas item di keranjang
    function changeQuantity(itemId, change) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            }
        }
        saveCart();
    }

    // Tampilkan username awal
    if (savedName) {
        customerNameDisplay.textContent = `Hai, ${savedName}!`;
    } else {
        customerNameDisplay.textContent = "Selamat Datang!";
        // Panggil fungsi login jika belum login
        // login(); // Anda mungkin ingin mengaktifkan ini jika login diwajibkan
    }

    // Fungsi login yang sudah ada (diperbaiki sedikit untuk customerNameDisplay)
    async function login() {
        let version = "";
        const versionSelect = await Swal.fire({
            title: "Kamu bermain dimana?", // Ini mungkin tidak relevan untuk warung makan, bisa dihapus atau diubah
            showDenyButton: true,
            background: "rgb(29, 28, 28)",
            color: "#fff",
            confirmButtonText: "Online",
            denyButtonText: "Offline",
            denyButtonColor: "#7066e0",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
        });

        if (versionSelect.isDenied) version = "."; // Ini juga mungkin tidak relevan

        Swal.fire({
            title: "Masukkan Nama Anda",
            input: "text",
            background: "rgb(29, 28, 28)",
            color: "#fff",
            inputAttributes: {
                autocapitalize: "words", // Ganti ke "words" untuk nama
            },
            showCancelButton: false,
            confirmButtonText: "Submit",
            cancelButtonText: "Batal",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value || value.trim() === "") return "Nama tidak boleh kosong!";
                // Anda bisa menambahkan regex yang lebih sesuai untuk nama jika perlu
            },
            preConfirm: (name) => {
                localStorage.setItem("userName", name); // Simpan nama tanpa "version"
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Hello, ${result.value}!`,
                    icon: "success",
                    background: "rgb(29, 28, 28)",
                    color: "#fff",
                });
                customerNameDisplay.textContent = `Hai, ${result.value}!`;
                savedName = result.value; // Perbarui savedName setelah login
            }
        });
    }

    // Event listener untuk klik item makanan
    document.querySelectorAll(".food-item").forEach(item => {
        item.addEventListener("click", function() {
            const foodId = this.getAttribute('data-id');
            const foodName = this.getAttribute('data-name');
            const basePrice = parseInt(this.getAttribute('data-price'));
            const finalPrice = Math.round(basePrice * (1 - discount));

            Swal.fire({
                title: `Tambahkan ${foodName} ke Keranjang?`,
                text: `Harga: Rp ${finalPrice.toLocaleString("id-ID")}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Tambahkan',
                cancelButtonText: 'Batal',
                background: "rgb(29, 28, 28)",
                color: "#fff",
            }).then((result) => {
                if (result.isConfirmed) {
                    addToCart({
                        id: foodId,
                        name: foodName,
                        price: finalPrice
                    });
                    Swal.fire({
                        title: 'Berhasil!',
                        text: `${foodName} telah ditambahkan ke keranjang.`,
                        icon: 'success',
                        background: "rgb(29, 28, 28)",
                        color: "#fff",
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        });
    });

    // Event listener untuk klik ikon keranjang
    cartIcon.addEventListener("click", function() {
        showCartModal();
    });

    // Fungsi untuk menampilkan modal keranjang
    async function showCartModal() {
        if (cart.length === 0) {
            Swal.fire({
                title: 'Keranjang Kosong',
                text: 'Silakan pilih menu makanan terlebih dahulu.',
                icon: 'info',
                background: "rgb(29, 28, 28)",
                color: "#fff",
                confirmButtonText: 'Oke'
            });
            return;
        }

        let cartContent = '<div class="cart-item-list">';
        let totalAmount = 0;

        cart.forEach(item => {
            totalAmount += item.price * item.quantity;
            cartContent += `
                <div class="cart-item">
                    <span class="cart-item-name">${item.name} (Rp ${item.price.toLocaleString("id-ID")})</span>
                    <div class="cart-item-controls">
                        <button class="quantity-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-plus" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">Hapus</button>
                    </div>
                </div>
            `;
        });
        cartContent += '</div>';
        cartContent += `<div class="cart-summary">Total: Rp ${totalAmount.toLocaleString("id-ID")}</div>`;

        const {
            value: formValues
        } = await Swal.fire({
            title: 'Keranjang Belanja',
            html: cartContent,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Lanjutkan ke Checkout',
            cancelButtonText: 'Kembali',
            showCloseButton: true,
            background: "rgb(29, 28, 28)",
            color: "#fff",
            didOpen: () => {
                document.querySelectorAll('.quantity-minus').forEach(button => {
                    button.onclick = (e) => {
                        const itemId = e.target.dataset.id;
                        changeQuantity(itemId, -1);
                        showCartModal(); // Refresh modal
                    };
                });
                document.querySelectorAll('.quantity-plus').forEach(button => {
                    button.onclick = (e) => {
                        const itemId = e.target.dataset.id;
                        changeQuantity(itemId, 1);
                        showCartModal(); // Refresh modal
                    };
                });
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.onclick = (e) => {
                        const itemId = e.target.dataset.id;
                        removeFromCart(itemId);
                        showCartModal(); // Refresh modal
                    };
                });
            }
        });

        if (formValues) {
            promptForCustomerDetails(totalAmount);
        }
    }

    // Fungsi untuk meminta detail pelanggan sebelum checkout
    async function promptForCustomerDetails(totalAmount) {
        const {
            value: formValues
        } = await Swal.fire({
            title: 'Detail Pengiriman',
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="Nama Lengkap Anda" value="${savedName || ''}">
                <input id="swal-input2" class="swal2-input" placeholder="Nomor WhatsApp (cth: 62812xxxx)" type="tel">
                <textarea id="swal-input3" class="swal2-textarea" placeholder="Alamat Lengkap (Jl. ..., No. ..., RT/RW, Kec., Kota)"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Bayar Sekarang',
            cancelButtonText: 'Batal',
            background: "rgb(29, 28, 28)",
            color: "#fff",
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#swal-input1').value;
                const whatsapp = Swal.getPopup().querySelector('#swal-input2').value;
                const address = Swal.getPopup().querySelector('#swal-input3').value;

                if (!name || !whatsapp || !address) {
                    Swal.showValidationMessage(`Harap lengkapi semua data!`);
                    return false;
                }
                if (!whatsapp.match(/^\d{10,15}$/)) { // Simple validation for whatsapp number
                    Swal.showValidationMessage(`Nomor WhatsApp tidak valid!`);
                    return false;
                }
                return {
                    name: name,
                    whatsapp: whatsapp,
                    address: address
                };
            }
        });

        if (formValues) {
            initiateTrakteerPayment(totalAmount, formValues.name, formValues.whatsapp, formValues.address);
        }
    }


    // Fungsi untuk memulai pembayaran Trakteer
    function initiateTrakteerPayment(amount, customerName, whatsapp, address) {
        // Asumsi: 1 unit di Trakteer Anda diatur seharga Rp 1.
        // Jadi, jumlah unit yang dikirim adalah total nominal rupiah.
        const trakteerQuantity = amount / 1000; // Contoh: 50000 / 1000 = 50

        // Buat pesan untuk Trakteer
        let message = `Pesanan dari ${customerName} (WA: ${whatsapp})\n\n`;
        message += `Alamat: ${address}\n\n`;
        message += `Daftar Pesanan:\n`;
        cart.forEach(item => {
            message += `- ${item.name} x ${item.quantity} (Rp ${item.price.toLocaleString("id-ID")})\n`;
        });
        message += `\nTotal: Rp ${amount.toLocaleString("id-ID")}`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);

        // URL Trakteer Anda (Ganti dengan URL Trakteer Anda yang sebenarnya)
        const trakteerBaseUrl = `https://trakteer.id/ndarufood/tip/embed/modal`; // Ganti ndarufood dengan username trakteer Anda

        // Construct the Trakteer URL
       const trakteerUrl = `${trakteerBaseUrl}?step=2&supporter_message=${encodedMessage}&quantity=${trakteerQuantity}&payment_method=qris&display_name=${customerName}&email=customer@example.com`;

        trakteerIframe.src = trakteerUrl;
        trakteerIframe.style.display = "block";

        // Mendengarkan event dari iframe Trakteer untuk menutup modal
        window.addEventListener("message", function(event) {
            // Pastikan event.origin sesuai dengan domain Trakteer
            if (event.origin === "https://trakteer.id" && "embed.modalClosed" === event.data.type) {
                setTimeout(function() {
                    trakteerIframe.style.display = "none";
                    Swal.fire({
                        title: 'Pesanan Diterima!',
                        html: 'Terima kasih atas pesanan Anda. Kami akan segera memprosesnya. <br><br>Anda dapat menghubungi kami melalui WhatsApp untuk konfirmasi: <a href="https://wa.me/yourphonenumber" target="_blank" style="color: #a7d5ec;">Hubungi Kami</a>', // Ganti yourphonenumber
                        icon: 'success',
                        background: "rgb(29, 28, 28)",
                        color: "#fff",
                        confirmButtonText: 'Oke'
                    });
                    cart = []; // Kosongkan keranjang setelah checkout
                    saveCart();
                }, 200);
            }
        });
    }

    // Inisialisasi tampilan keranjang saat halaman dimuat
    updateCartDisplay();
});