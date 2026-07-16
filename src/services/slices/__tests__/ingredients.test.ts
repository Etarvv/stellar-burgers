import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';

const getInitialState = () =>
  ingredientsReducer(undefined, { type: 'UNKNOWN' });

describe('ingredients slice', () => {
  test('should return initial state with unknown action', () => {
    const initialState = getInitialState();
    expect(initialState).toEqual({
      items: [],
      loading: false,
      error: null
    });
  });

  test('should handle fetchIngredients.pending', () => {
    const initialState = getInitialState();
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('should handle fetchIngredients.fulfilled', () => {
    const initialState = getInitialState();
    const mockData = [
      {
        _id: '1',
        name: 'Булка',
        type: 'bun',
        proteins: 10,
        fat: 5,
        carbohydrates: 20,
        calories: 200,
        price: 50,
        image: '',
        image_mobile: '',
        image_large: '',
        __v: 0
      },
      {
        _id: '2',
        name: 'Котлета',
        type: 'main',
        proteins: 20,
        fat: 15,
        carbohydrates: 10,
        calories: 300,
        price: 80,
        image: '',
        image_mobile: '',
        image_large: '',
        __v: 0
      }
    ];
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockData
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.items).toEqual(mockData);
  });

  test('should handle fetchIngredients.rejected', () => {
    const initialState = getInitialState();
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка загрузки' }
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });
});
