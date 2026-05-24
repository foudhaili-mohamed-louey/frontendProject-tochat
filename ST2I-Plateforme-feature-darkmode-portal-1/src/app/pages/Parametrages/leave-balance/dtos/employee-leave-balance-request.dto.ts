export interface EmployeeLeaveBalanceRequestDTO {
  idEmployee: number;
  idLeaveType: number;
  year: number;
  currentBalance: number;
}