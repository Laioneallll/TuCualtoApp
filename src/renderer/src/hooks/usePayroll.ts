import { useCallback, useEffect, useState } from 'react'
import type { Employee, EmployeePayload, PayrollRecord, SendPayrollPayload } from '../types'

export const usePayroll = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [emps, records] = await Promise.all([window.api.employees.list(), window.api.payroll.list()])
      setEmployees(emps)
      setPayrollRecords(records)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const createEmployee = useCallback(
    async (payload: EmployeePayload) => {
      await window.api.employees.create(payload)
      await refetch()
    },
    [refetch]
  )

  const updateEmployee = useCallback(
    async (id: number, payload: EmployeePayload) => {
      await window.api.employees.update(id, payload)
      await refetch()
    },
    [refetch]
  )

  const deleteEmployee = useCallback(
    async (id: number) => {
      await window.api.employees.remove(id)
      await refetch()
    },
    [refetch]
  )

  const sendPayroll = useCallback(
    async (payload: SendPayrollPayload) => {
      await window.api.payroll.send(payload)
      await refetch()
    },
    [refetch]
  )

  return {
    loading,
    employees,
    payrollRecords,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    sendPayroll,
    refetch
  }
}

export type UsePayroll = ReturnType<typeof usePayroll>
