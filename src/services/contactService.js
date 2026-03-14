import { contactModel } from '~/models/contactModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const createdContact = await contactModel.createNew(reqBody)
    const getNewContact = await contactModel.findOneById(createdContact.insertedId)
    return getNewContact
  } catch (error) { throw error }
}

const getContacts = async () => {
  try {
    const results = await contactModel.getContacts()
    return results
  } catch (error) { throw error }
}

const getDetails = async (contactId) => {
  try {
    const contact = await contactModel.findOneById(contactId)
    if (!contact) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy liên hệ!')
    return contact
  } catch (error) { throw error }
}

const update = async (contactId, reqBody) => {
  try {
    const contact = await contactModel.findOneById(contactId)
    if (!contact) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy liên hệ!')

    const updatedContact = await contactModel.update(contactId, reqBody)
    return updatedContact
  } catch (error) { throw error }
}

const deleteItem = async (contactId) => {
  try {
    const contact = await contactModel.findOneById(contactId)
    if (!contact) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy liên hệ!')
    await contactModel.deleteByOneId(contactId)
    return { deleteResult: 'Xóa liên hệ thành công!' }
  } catch (error) { throw error }
}

export const contactService = {
  createNew,
  getContacts,
  getDetails,
  update,
  deleteItem
}
