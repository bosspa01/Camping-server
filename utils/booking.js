const calNight = (checkIn, checkOut) => {
  const milliDay = checkOut.getTime() - checkIn.getTime();
  const diffDay = milliDay / (1000 * 60 * 60 * 24);
  return diffDay;
};

exports.calTotal = (checkIn, checkOut, price) => {
  if (!checkIn || !checkOut) return;


    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    // console.log("*****",typeof checkInDate);



  const totalNights = calNight(checkInDate, checkOutDate);
  const total = totalNights * price;
  //   console.log("*", totalNights, total);
  return { total, totalNights };
};
