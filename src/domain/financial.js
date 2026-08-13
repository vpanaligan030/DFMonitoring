const amount = value => { const n = Number(value ?? 0); return Number.isFinite(n) ? n : 0; };
export const money = amount;
export const peso = value => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:2}).format(amount(value)).replace('PHP','₱');
export const getUnutilizedAmount = df => Math.max(amount(df.released_amount)-amount(df.utilized_amount),0);
export const getOverutilizedAmount = df => Math.max(amount(df.utilized_amount)-amount(df.released_amount),0);
export const getReturnedAmount = df => amount(df.returned_amount);
export const getReturnConfirmedAmount = df => amount(df.sdo_return_confirmed_amount);
export const getRemainingReturnVariance = df => Math.max(getUnutilizedAmount(df)-getReturnConfirmedAmount(df),0);
export const getReimbursedAmount = df => amount(df.reimbursed_amount);
export const getReimbursementConfirmedAmount = df => amount(df.section_reimbursement_confirmed_amount);
export const getRemainingUnreimbursed = df => Math.max(getOverutilizedAmount(df)-getReimbursedAmount(df),0);
export const getUnconfirmedReimbursement = df => Math.max(getReimbursedAmount(df)-getReimbursementConfirmedAmount(df),0);
export function isFinanciallyReconciled(df){
  const unused=getUnutilizedAmount(df), over=getOverutilizedAmount(df);
  const returnsOk=unused===0 || (getReturnConfirmedAmount(df)===getReturnedAmount(df) && (getReturnedAmount(df)===unused || df.partial_return_exception_status==='ACCEPTED'));
  const reimbursementOk=over===0 || (getReimbursedAmount(df)===over && getReimbursementConfirmedAmount(df)===over);
  return returnsOk && reimbursementOk && !df.return_discrepancy_open && !df.reimbursement_discrepancy_open;
}
export const canComplete = df => df.status==='UTILIZATION_RECORDED' && df.original_receipt_status==='RECEIVED' && df.fur_status==='RECEIVED' && isFinanciallyReconciled(df);
export function getFinancialStatus(df){ if(getRemainingReturnVariance(df)>0) return 'RETURN_PENDING'; if(getRemainingUnreimbursed(df)>0) return 'REIMBURSEMENT_PENDING'; if(getUnconfirmedReimbursement(df)>0) return 'REIMBURSEMENT_CONFIRMATION'; return isFinanciallyReconciled(df)?'RECONCILED':'PENDING_CONFIRMATION'; }
export function integrityIssues(df){
  const issues=[]; const fields=['requested_amount','approved_amount','released_amount','utilized_amount','returned_amount','sdo_return_confirmed_amount','reimbursed_amount','section_reimbursement_confirmed_amount'];
  fields.forEach(k=>{ if(df[k]!=null && (!Number.isFinite(Number(df[k])) || Number(df[k])<0)) issues.push(`Invalid ${k}`); });
  if(amount(df.approved_amount)>amount(df.requested_amount)) issues.push('Approval exceeds request');
  if(amount(df.released_amount)>amount(df.approved_amount)) issues.push('Release exceeds approval');
  if(getReturnedAmount(df)>getUnutilizedAmount(df)) issues.push('Return exceeds unused funds');
  if(getReturnConfirmedAmount(df)>getReturnedAmount(df)) issues.push('Confirmed return exceeds reported return');
  if(getReimbursedAmount(df)>getOverutilizedAmount(df)) issues.push('Reimbursement exceeds obligation');
  if(getReimbursementConfirmedAmount(df)>getReimbursedAmount(df)) issues.push('Confirmed reimbursement exceeds recorded reimbursement');
  if(df.status==='COMPLETED' && (df.verification_status!=='VERIFIED'||df.original_receipt_status!=='RECEIVED'||df.fur_status!=='RECEIVED'||!isFinanciallyReconciled(df))) issues.push('Invalid completion state');
  return issues;
}
