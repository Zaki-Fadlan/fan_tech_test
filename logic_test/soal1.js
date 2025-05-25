const arrInput1 = [10, 20, 20, 10, 10, 30, 50, 10, 20];
const arrInput2 = [6, 5, 2, 3, 5, 2, 2, 1, 1, 5, 1, 3, 3, 3, 5];
const arrInput3 = [1, 1, 3, 1, 2, 1, 3, 3, 3, 3];
const countCouple = (inputArr) => {
  const uniqueNum = [...new Set(inputArr)]; // Unique Value
  let coupleSum = 0;
  // Loop Unique Number
  uniqueNum.map((num) => {
    // Loop array
    const count = Math.floor(
      // => filter Input based on unique number ==>([... unique, unique]) =>count result using lenght
      inputArr.filter((item) => item === num).length / 2
    );
    // => divide 2 and round down the counted result
    coupleSum += count;
    // => add value the value to coupleSum
  });

  return coupleSum;
};
const inputCase = [arrInput1, arrInput2, arrInput3];
for (let i = 0; i < inputCase.length; i++) {
  console.log(
    `input ${i + 1} : ${inputCase[i]}\nOutput : ${countCouple(inputCase[i])}\n`
  );
}
