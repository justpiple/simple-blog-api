# Simple Blog API

## Installation

```bash
$ npm install
```

```bash
$ npm run prisma
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

---

# Design Patterns

## Repository Design Pattern

Repository Design Pattern mengenkapsulasi logika akses dan manipulasi data, sehingga lebih mudah untuk dikelola dan diuji. Pattern ini bertindak sebagai perantara antara domain dan data mapping layer, memastikan bahwa logika akses data terpusat dan dapat digunakan kembali.

### Mengapa Menggunakannya?

Dengan memisahkan logika akses data, akan lebih mudah merubahnya jika ada perubahan dalam design database

## Singleton Design Pattern

Singleton Design Pattern bertujuan agar sebuah kelas hanya memiliki satu instance yang menyediakan akses global ke instance tersebut. Ini sangat berguna untuk mengelola resource bersama atau mengontrol akses terhadap beberapa layanan.

### Mengapa Menggunakannya?

- **Kontrol Akses Terpusat**: Memastikan hanya ada satu instance dari kelas tertentu, sehingga resource atau service dapat dikelola dengan lebih efektif.
- **Penggunaan Memori Efisien**: Mengurangi penggunaan memori dengan memastikan bahwa hanya ada satu instance yang dibuat.

```

```
