interface IMealParam {
  meal_id: string;
  meal_name: string;
  meal_description: string;
  meal_date_time: string;
  is_inside: boolean;
  user_id: string;
}

export function calcBestSequenceDiet(meals: IMealParam[]): number {
  const listSequence: number[] = [];
  let countSequence: number = 0;

  const listIsInDiet = meals.map(({ is_inside }) => is_inside);

  listIsInDiet.forEach((item, index) => {
    if (item) {
      countSequence++;
    } else {
      listSequence.push(countSequence);
      countSequence = 0;
    }

    if (listIsInDiet.length - 1 === index) {
      listSequence.push(countSequence);
    }
  });

  return Math.max(...listSequence);
}
