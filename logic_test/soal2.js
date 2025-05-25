const example = "Kemarin Shopia per[gi ke mall."; // expected output : 4
const strInput1 = "Saat meng*ecat tembok, Agung dib_antu oleh Raihan."; // expected output : 5
const strInput2 = "Berapa u(mur minimal[ untuk !mengurus ktp?"; // expected output : 3
const strInput3 = "Masing-masing anak mendap(atkan uang jajan ya=ng be&rbeda."; // expected output : 4
//  Solution Regex
// exception [Read Marks like . , ?] [quotes mark like ' " ] and - separator
const allowed = /^[a-zA-Z0-9.,?"'-]+$/;

const countValidWord = (data) => {
  const strToList = data.split(" "); // convert to list based on space
  let validWord = 0;

  strToList.forEach((item) => {
    if (allowed.test(item)) {
      validWord += 1;
    }
  });
  return validWord;
};

const arrinput = [example, strInput1, strInput2, strInput3];
for (let i = 0; i < arrinput.length; i++) {
  console.log(
    `Input ${i}: ${arrinput[i]}\nOutput: ${countValidWord(arrinput[i])}\n`
  );
}
