const toCents = value => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) : 0;
};
const fromCents = cents => cents / 100;
const amount = value => fromCents(toCents(value));
export const money = amount;
export const peso = value => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:2}).format(amount(value)).replace('PHP','₱');
export const getUnutilizedAmount = df => fromCents(Math.max(toCents(df.released_amount)-toCents(df.utilized_amount),0));
export const getOverutilizedAmount = df => fromCents(Math.max(toCents(df.utilized_amount)-toCents(df.released_amount),0));
export const getReturnedAmount = df => amount(df.returned_amount);
export const getReturnConfirmedAmount = df => amount(df.sdo_return_confirmed_amount);
export const getRemainingReturnVariance = df => fromCents(Math.max(toCents(getUnutilizedAmount(df))-toCents(getReturnConfirmedAmount(df)),0));
export const getReimbursedAmount = df => amount(df.reimbursed_amount);
export const getReimbursementConfirmedAmount = df => amount(df.section_reimbursement_confirmed_amount);
export const getRemainingUnreimbursed = df => fromCents(Math.max(toCents(getOverutilizedAmount(df))-toCents(getReimbursedAmount(df)),0));
export const getUnconfirmedReimbursement = df => fromCents(Math.max(toCents(getReimbursedAmount(df))-toCents(getReimbursementConfirmedAmount(df)),0));
export function isFinanciallyReconciled(df){
  const unused=toCents(getUnutilizedAmount(df)), over=toCents(getOverutilizedAmount(df));
  const returned=toCents(getReturnedAmount(df)), confirmedReturn=toCents(getReturnConfirmedAmount(df));
  const reimbursed=toCents(getReimbursedAmount(df)), confirmedReimbursement=toCents(getReimbursementConfirmedAmount(df));
  const returnsOk=unused===0 || (confirmedReturn===returned && (returned===unused || df.partial_return_exception_status==='ACCEPTED'));
  const reimbursementOk=over===0 || (reimbursed===over && confirmedReimbursement===over);
  return returnsOk && reimbursementOk && !df.return_discrepancy_open && !df.reimbursement_discrepancy_open;
}
export const canComplete = df => df.status==='UTILIZATION_RECORDED' && df.original_receipt_status==='RECEIVED' && df.fur_status==='RECEIVED' && isFinanciallyReconciled(df);
export function getFinancialStatus(df){ if(getRemainingReturnVariance(df)>0) return 'RETURN_PENDING'; if(getRemainingUnreimbursed(df)>0) return 'REIMBURSEMENT_PENDING'; if(getUnconfirmedReimbursement(df)>0) return 'REIMBURSEMENT_CONFIRMATION'; return isFinanciallyReconciled(df)?'RECONCILED':'PENDING_CONFIRMATION'; }
export function integrityIssues(df){
  const issues=[]; const fields=['requested_amount','approved_amount','released_amount','utilized_amount','returned_amount','sdo_return_confirmed_amount','reimbursed_amount','section_reimbursement_confirmed_amount'];
  fields.forEach(k=>{ if(df[k]!=null && (!Number.isFinite(Number(df[k])) || Number(df[k])<0)) issues.push(`Invalid ${k}`); });
  if(toCents(df.approved_amount)>toCents(df.requested_amount)) issues.push('Approval exceeds request');
  if(toCents(df.released_amount)>toCents(df.approved_amount)) issues.push('Release exceeds approval');
  if(toCents(getReturnedAmount(df))>toCents(getUnutilizedAmount(df))) issues.push('Return exceeds unused funds');
  if(toCents(getReturnConfirmedAmount(df))>toCents(getReturnedAmount(df))) issues.push('Confirmed return exceeds reported return');
  if(toCents(getReimbursedAmount(df))>toCents(getOverutilizedAmount(df))) issues.push('Reimbursement exceeds obligation');
  if(toCents(getReimbursementConfirmedAmount(df))>toCents(getReimbursedAmount(df))) issues.push('Confirmed reimbursement exceeds recorded reimbursement');
  if(df.status==='COMPLETED' && (df.verification_status!=='VERIFIED'||df.original_receipt_status!=='RECEIVED'||df.fur_status!=='RECEIVED'||!isFinanciallyReconciled(df))) issues.push('Invalid completion state');
  return issues;
}
