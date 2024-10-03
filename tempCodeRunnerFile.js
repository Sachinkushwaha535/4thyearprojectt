const MONG_URL = "mongodb://127.0.0.1:27017/wonderlust"

main()
.then(() => {
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONG_URL);
}
a