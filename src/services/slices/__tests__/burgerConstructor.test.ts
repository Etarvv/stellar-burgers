import constructorReducer, {
  addIngredient,
  removeIngredient,
  clearConstructor
} from '../constructorSlice';
import { TIngredient } from '../../../utils/types';

const getInitialState = () =>
  constructorReducer(undefined, { type: 'UNKNOWN' });

describe('burgerConstructor slice', () => {
  test('should return initial state with unknown action', () => {
    const initialState = getInitialState();
    expect(initialState).toEqual({
      bun: null,
      ingredients: []
    });
  });

  test('should handle addIngredient with bun', () => {
    const initialState = getInitialState();
    const bun: TIngredient = {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      price: 50,
      image: '',
      proteins: 10,
      fat: 5,
      carbohydrates: 20,
      calories: 200,
      image_mobile: '',
      image_large: ''
    };
    const action = addIngredient(bun);
    const state = constructorReducer(initialState, action);
    expect(state.bun).toMatchObject({
      ...bun,
      id: expect.any(String)
    });
  });

  test('should handle addIngredient with filling', () => {
    const initialState = getInitialState();
    const filling: TIngredient = {
      _id: '2',
      name: 'Котлета',
      type: 'main',
      price: 80,
      image: '',
      proteins: 20,
      fat: 15,
      carbohydrates: 10,
      calories: 300,
      image_mobile: '',
      image_large: ''
    };
    const action = addIngredient(filling);
    const state = constructorReducer(initialState, action);
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject({
      ...filling,
      id: expect.any(String)
    });
  });

  test('should handle removeIngredient', () => {
    const initialState = getInitialState();
    const filling1: TIngredient = {
      _id: '2',
      name: 'Котлета',
      type: 'main',
      price: 80,
      image: '',
      proteins: 20,
      fat: 15,
      carbohydrates: 10,
      calories: 300,
      image_mobile: '',
      image_large: ''
    };
    const filling2: TIngredient = {
      _id: '3',
      name: 'Сыр',
      type: 'main',
      price: 40,
      image: '',
      proteins: 10,
      fat: 20,
      carbohydrates: 5,
      calories: 150,
      image_mobile: '',
      image_large: ''
    };
    let state = constructorReducer(initialState, addIngredient(filling1));
    state = constructorReducer(state, addIngredient(filling2));
    expect(state.ingredients).toHaveLength(2);

    const idToRemove = state.ingredients[0].id;
    const action = removeIngredient(idToRemove);
    const newState = constructorReducer(state, action);
    expect(newState.ingredients).toHaveLength(1);
    expect(newState.ingredients[0].name).toBe('Сыр');
  });

  test('should handle clearConstructor', () => {
    const initialState = getInitialState();
    const bun: TIngredient = {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      price: 50,
      image: '',
      proteins: 10,
      fat: 5,
      carbohydrates: 20,
      calories: 200,
      image_mobile: '',
      image_large: ''
    };
    const filling: TIngredient = {
      _id: '2',
      name: 'Котлета',
      type: 'main',
      price: 80,
      image: '',
      proteins: 20,
      fat: 15,
      carbohydrates: 10,
      calories: 300,
      image_mobile: '',
      image_large: ''
    };
    let state = constructorReducer(initialState, addIngredient(bun));
    state = constructorReducer(state, addIngredient(filling));
    expect(state.bun).not.toBeNull();
    expect(state.ingredients).toHaveLength(1);

    const action = clearConstructor();
    const newState = constructorReducer(state, action);
    expect(newState).toEqual(initialState);
  });
});
