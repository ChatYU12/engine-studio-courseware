// Pressure curves are normalized across one 0.8 s teaching cycle.
// Values are representative and smoothed for instruction, not patient data.
const smooth = (a,b,t) => {
  const x = Math.max(0,Math.min(1,(t-a)/(b-a)));
  return x*x*(3-2*x);
};
function interp(t,knots){
  for(let i=1;i<knots.length;i++) if(t<=knots[i][0]) {
    const [a,va]=knots[i-1],[b,vb]=knots[i],u=smooth(a,b,t);
    return va+(vb-va)*u;
  }
  return knots.at(-1)[1];
}

export const leftPressure=t=>interp(t,[[0,5],[.08,5],[.12,12],[.18,80],[.24,126],[.29,121],[.36,112],[.40,105],[.43,94],[.447,58],[.47,22],[.49,8],[.50,5],[.54,5],[.68,5],[1,5]]);
export const aorticPressure=t=>interp(t,[[0,80],[.12,80],[.18,80],[.24,120],[.29,118],[.35,111],[.40,102],[.43,94],[.442,82],[.454,89],[.49,84],[.62,80],[1,80]]);
export const leftAtrial=t=>interp(t,[[0,7],[.035,8],[.06,9],[.10,11],[.12,12],[.15,10],[.21,7],[.33,6],[.40,7],[.43,12],[.47,11],[.49,8],[.50,8],[.54,6],[.68,5],[.9,6],[1,7]]);
export const rightVentricular=t=>interp(t,[[0,3],[.10,2],[.12,7],[.18,8],[.24,24],[.29,24],[.36,20],[.40,15.5],[.43,11],[.435,8.5],[.46,5],[.49,2],[.62,2],[1,3]]);
export const pulmonaryPressure=t=>interp(t,[[0,8],[.12,8],[.18,8],[.24,23],[.29,23],[.36,19],[.43,11],[.44,10],[.47,9],[.50,8],[.68,8],[1,8]]);
export const rightAtrial=t=>interp(t,[[0,4],[.035,5],[.06,6],[.10,6.5],[.12,7],[.16,5],[.22,3],[.35,3],[.43,6],[.47,3],[.49,2],[.50,3],[.53,3],[.7,3],[1,4]]);
