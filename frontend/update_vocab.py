# -*- coding: utf-8 -*-
import codecs
import re

with codecs.open('components/StoryDialogueIntro.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

new_db = '''const VOCABULARY_DB: Record<string, WordDefinition> = {
  interview: { word: 'interview', definition: 'Reunión formal donde se hacen preguntas', example: 'I have a job interview tomorrow.', partOfSpeech: 'noun' },
  nervous: { word: 'nervous', definition: 'Ansioso o preocupado', example: 'She feels nervous before the interview.', partOfSpeech: 'adjective' },
  opportunity: { word: 'opportunity', definition: 'Ocasión o posibilidad favorable', example: 'This is a great opportunity for you.', partOfSpeech: 'noun' },
  prepare: { word: 'prepare', definition: 'Preparar o alistarse', example: 'You should prepare for the meeting.', partOfSpeech: 'verb' },
  experience: { word: 'experience', definition: 'Experiencia o vivencia', example: 'I have 5 years of experience in this field.', partOfSpeech: 'noun' },
  questions: { word: 'questions', definition: 'Preguntas', example: 'The interviewer asked many questions.', partOfSpeech: 'noun' },
  confident: { word: 'confident', definition: 'Seguro de sí mismo', example: 'You should be confident during the interview.', partOfSpeech: 'adjective' },
  position: { word: 'position', definition: 'Puesto o cargo de trabajo', example: 'She applied for the position of manager.', partOfSpeech: 'noun' },
  great: { word: 'great', definition: 'Excelente o magnífico', example: 'That is a great idea!', partOfSpeech: 'adjective' },
  impression: { word: 'impression', definition: 'Impresión o efecto causado', example: 'I want to make a good impression.', partOfSpeech: 'noun' },
  // Story 1: Flight
  departed: { word: 'departed', definition: 'Salido o partido (vuelo, tren)', example: 'The train departed at noon.', partOfSpeech: 'verb' },
  urgently: { word: 'urgently', definition: 'Con mucha prisa de manera urgente', example: 'I need to see the doctor urgently.', partOfSpeech: 'adverb' },
  immediately: { word: 'immediately', definition: 'De inmediato, al instante', example: 'Please call me immediately.', partOfSpeech: 'adverb' },
  connecting: { word: 'connecting', definition: 'Vuelo de conexión', example: 'I missed my connecting flight.', partOfSpeech: 'adjective' },
  worried: { word: 'worried', definition: 'Preocupado o intranquilo', example: 'She was worried about the exam.', partOfSpeech: 'adjective' },
  boarding: { word: 'boarding', definition: 'Embarque o proceso de subida', example: 'Boarding starts in 10 minutes.', partOfSpeech: 'noun' },
  quickly: { word: 'quickly', definition: 'Rápidamente, con velocidad', example: 'He ran quickly to catch the bus.', partOfSpeech: 'adverb' },
  pass: { word: 'pass', definition: 'Pase o boleto (abordaje)', example: 'Show your boarding pass.', partOfSpeech: 'noun' },
  // Story 2: Interview
  excited: { word: 'excited', definition: 'Emocionado o entusiasmado', example: 'I am excited about the new project.', partOfSpeech: 'adjective' },
  technical: { word: 'technical', definition: 'Relacionado con la técnica, técnico', example: 'She has great technical skills.', partOfSpeech: 'adjective' },
  skills: { word: 'skills', definition: 'Habilidades o capacidades', example: 'Improving your writing skills is important.', partOfSpeech: 'noun' },
  specialize: { word: 'specialize', definition: 'Especializarse en un área', example: 'They specialize in web design.', partOfSpeech: 'verb' },
  familiar: { word: 'familiar', definition: 'Conocido o estar acostumbrado a algo', example: 'Are you familiar with this software?', partOfSpeech: 'adjective' },
  cloud: { word: 'cloud', definition: 'La nube, almacenamiento remoto', example: 'All my files are saved in the cloud.', partOfSpeech: 'noun' },
  // Story 3: Dark City
  strange: { word: 'strange', definition: 'Extraño, raro o desconocido', example: 'I heard a strange noise outside.', partOfSpeech: 'adjective' },
  confusing: { word: 'confusing', definition: 'Confuso o difícil de entender', example: 'The instructions were very confusing.', partOfSpeech: 'adjective' },
  neighborhood: { word: 'neighborhood', definition: 'Barrio, vecindario', example: 'We live in a quiet neighborhood.', partOfSpeech: 'noun' },
  safe: { word: 'safe', definition: 'Seguro, libre de peligro', example: 'Is it safe to walk here at night?', partOfSpeech: 'adjective' },
  careful: { word: 'careful', definition: 'Cuidadoso, prudente', example: 'Be careful with that hot coffee.', partOfSpeech: 'adjective' },
  stranger: { word: 'stranger', definition: 'Desconocido', example: 'Do not talk to strangers.', partOfSpeech: 'noun' },
  // Story 4: Doctor
  unwell: { word: 'unwell', definition: 'Enfermo o indispuesto', example: 'I am feeling quite unwell today.', partOfSpeech: 'adjective' },
  terrible: { word: 'terrible', definition: 'Muy malo o doloroso', example: 'He has a terrible stomachache.', partOfSpeech: 'adjective' },
  headache: { word: 'headache', definition: 'Dolor de cabeza', example: 'Loud music gives me a headache.', partOfSpeech: 'noun' },
  fever: { word: 'fever', definition: 'Fiebre', example: 'The child has a high fever.', partOfSpeech: 'noun' },
  uncomfortable: { word: 'uncomfortable', definition: 'Incómodo', example: 'This chair is really uncomfortable.', partOfSpeech: 'adjective' },
  medication: { word: 'medication', definition: 'Medicación o medicina', example: 'Are you taking any medication?', partOfSpeech: 'noun' },
  temperature: { word: 'temperature', definition: 'Temperatura', example: 'The temperature will drop tonight.', partOfSpeech: 'noun' },
  moderate: { word: 'moderate', definition: 'Moderado o medio', example: 'Bake the cake at a moderate heat.', partOfSpeech: 'adjective' },
  examine: { word: 'examine', definition: 'Examinar o inspeccionar', example: 'The doctor will examine you now.', partOfSpeech: 'verb' },
  prescribe: { word: 'prescribe', definition: 'Recetar (medicinas)', example: 'I will prescribe some antibiotics.', partOfSpeech: 'verb' },
  // Story 5: Market
  visitor: { word: 'visitor', definition: 'Visitante o turista', example: 'The museum gets thousands of visitors.', partOfSpeech: 'noun' },
  recommend: { word: 'recommend', definition: 'Recomendar o aconsejar', example: 'Can you recommend a good book?', partOfSpeech: 'verb' },
  incredible: { word: 'incredible', definition: 'Increíble', example: 'The view from the top is incredible.', partOfSpeech: 'adjective' },
  souvenirs: { word: 'souvenirs', definition: 'Recuerdos de viaje', example: 'I bought some souvenirs in Paris.', partOfSpeech: 'noun' },
  negotiate: { word: 'negotiate', definition: 'Negociar precios o acuerdos', example: 'We have to negotiate the final price.', partOfSpeech: 'verb' },
  dumplings: { word: 'dumplings', definition: 'Empanadillas (comida)', example: 'These pork dumplings are delicious.', partOfSpeech: 'noun' },
  grilled: { word: 'grilled', definition: 'Parrillada, asado', example: 'I ordered a grilled chicken sandwich.', partOfSpeech: 'adjective' },
  skewers: { word: 'skewers', definition: 'Brochetas', example: 'Beef skewers are popular here.', partOfSpeech: 'noun' },
  // Story 6: Restaurant
  reservation: { word: 'reservation', definition: 'Reserva', example: 'I made a reservation for 8 PM.', partOfSpeech: 'noun' },
  beautiful: { word: 'beautiful', definition: 'Hermoso(a) o muy bonito(a)', example: 'She wore a beautiful dress.', partOfSpeech: 'adjective' },
  special: { word: 'special', definition: 'Especial o único', example: 'Today is a very special day.', partOfSpeech: 'adjective' },
  specialty: { word: 'specialty', definition: 'Especialidad', example: 'Seafood is the specialty of the house.', partOfSpeech: 'noun' },
  exceptional: { word: 'exceptional', definition: 'Excepcional o extraordinario', example: 'The service was exceptional.', partOfSpeech: 'adjective' },
  duck: { word: 'duck', definition: 'Pato (comida o animal)', example: 'We had roast duck for dinner.', partOfSpeech: 'noun' },
  // Story 7: Apartment
  landlord: { word: 'landlord', definition: 'Propietario / Casero', example: 'My landlord fixed the broken window.', partOfSpeech: 'noun' },
  apartment: { word: 'apartment', definition: 'Apartamento o piso', example: 'They just moved into a new apartment.', partOfSpeech: 'noun' },
  previous: { word: 'previous', definition: 'Anterior o previo', example: 'The previous owner left a couch.', partOfSpeech: 'adjective' },
  tenants: { word: 'tenants', definition: 'Inquilinos', example: 'The building has very quiet tenants.', partOfSpeech: 'noun' },
  modern: { word: 'modern', definition: 'Moderno', example: 'The kitchen has a modern design.', partOfSpeech: 'adjective' },
  renting: { word: 'renting', definition: 'Alquilando', example: 'They are renting a new car.', partOfSpeech: 'verb' }
}'''

start_idx = text.find('const VOCABULARY_DB')
# find the next line that is just '}' at the base level to end the object.
# simpler way: just split at function TypewriterText which follows it.
end_idx = text.find('function TypewriterText')

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + new_db + '\n\n' + text[end_idx:]
    with codecs.open('components/StoryDialogueIntro.tsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('Vocabulary expanded successfully.')
else:
    print('Indices not found.')
