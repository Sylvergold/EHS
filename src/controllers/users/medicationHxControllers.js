import Medication from '../../models/users/medicationHx.js';

//add a medication history;
export const addMedication = async (req, res) => {
  try {
    //validation
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: 'Provide a medication history' });
    }
    const newMhx = await Medication.create(data);
    // const newMhx = await Medication.findOne({
    //   where: { userId: data.userId },
    // });
    return res.status(200).json({
      message: 'medication added sucessfully',
      data: newMhx,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to add medication' });
  }
};
//return a medication history
export const fetchMedHx = async (req, res) => {
  try {
    //validation needed
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Provide a medication ID' });
    }
    const findMedHx = await Medication.findOne({ where: { id: id } });
    if (!findMedHx)
      return res.status(404).json({ message: 'Medication history found' });
    return res.status(200).json({
      message: 'Medication History  found',
      data: findMedHx,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to Find Medication History' });
  }
};
//return all medication history records
export const fetchAllMedHx = async (req, res) => {
  try {
    //validation needed
    const findAllMedHx = await Medication.findAll();
    if (!findAllMedHx)
      return res.status(404).json({ message: 'Unable to fetch history' });
    return res.status(200).json({
      message: 'Medication history found',
      data: findAllMedHx,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch medication history' });
  }
};

//return all medication history for a particular user
export const fetchAllUserMedHx = async (req, res) => {
  try {
    //validation needed
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Provide a medication ID' });
    }
    const findMedHx = await Medication.findAll({ where: { patientId: id }});
    if (!findMedHx)
      return res.status(404).json({ message: 'Medication history found' });
    return res.status(200).json({
      message: 'Medication History  found',
      data: findMedHx,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to Find Medication History' });
  }
};
