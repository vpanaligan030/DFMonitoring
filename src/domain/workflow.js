import { canComplete, getOverutilizedAmount, getRemainingReturnVariance, getUnconfirmedReimbursement, getUnutilizedAmount } from './financial.js';
export function getNextAction(df){
  const byStatus={DRAFT:'Complete and submit request',SUBMITTED_TO_SDO:'Awaiting SDO review',UNDER_SDO_REVIEW:'SDO review in progress',SENT_TO_CO:'Awaiting Liaison coordination',FOR_CO_DECISION:'Awaiting CO decision',CO_APPROVED:'Ready for fund release',CO_REJECTED:'Rejected',FUND_RELEASED:'Awaiting utilization',RETURNED_FOR_REVISION:'Revision required',COMPLETED:'Completed'};
  if(df.status!=='UTILIZATION_RECORDED') return byStatus[df.status]||'Pending action';
  if(getUnutilizedAmount(df)>0 && !df.returned_amount) return 'Unused funds must be returned';
  if(df.returned_amount && !df.sdo_return_confirmation_date) return 'Awaiting SDO return confirmation';
  if(getRemainingReturnVariance(df)>0 && df.partial_return_exception_status!=='ACCEPTED') return 'Partial-return exception requires SDO acceptance';
  if(getOverutilizedAmount(df)>0 && !df.reimbursed_amount) return 'Reimbursement required';
  if(getUnconfirmedReimbursement(df)>0) return 'Awaiting Section reimbursement confirmation';
  if(df.original_receipt_status!=='RECEIVED'||df.fur_status!=='RECEIVED') return 'Supporting documents pending';
  return canComplete(df)?'Ready for final verification':'Financial reconciliation pending';
}
