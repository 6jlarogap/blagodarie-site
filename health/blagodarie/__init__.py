#!../ENV/bin/python3

import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output
import plotly.graph_objects as go

import datetime, math, random
from functools import cmp_to_key

from utils import request_json, make_get_str, named_colors, cmp_symptoms_count_name, moon_phases

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

def serve_layout():

    page_children = [

        dcc.Location(id='url', refresh=False),

        html.H1(
            html.A('Благодарие', href='https://health.blagodarie.org'),
            style={'textAlign': 'center'},
        ),
    ]
    rc, data = request_json('/api/getstats/users')
    if rc == 200:
        page_children.extend([
            html.Div(
                'Пользователей: ' + str(data['users']) +
                ' Сообщений: ' + str(data['symptoms']),
                style={'textAlign': 'center'},
            ),
            html.Br(),
        ])
    page_children.extend([
        html.Div([
                html.Span('''
                    Дорогие бабушки и дедушки, было время когда вы жили
                    не замечая воздействия окружающей среды,
                    со временем вы начали их ощущать, дальше - больше...
                    Ваши дети и внуки идут за вами следом -
                    по мере взросления у них тоже начнут появляться похожие ощущения
                    с похожей периодичностью -
                '''),
                html.A(
                    'Установите приложение Благодарие для Android',
                    href='https://play.google.com/store/apps/details?id=org.blagodarie',
                ),
                html.Span('''
                    и отмечайте периодические улучшения и ухудшения вашего самочувствия -
                    мы сопоставим данные о самочувствии всех пользователей
                    с периодами вращения Земли, Луны, Венеры, Марса и других известных планет,
                    и используем математическую статистику для определения зависимостей
                    и подготовки персональных прогнозов самочувствия!
                    К тому времени, когда ваши дети и внуки
                    начнут ощущать влияние окружающей среды -
                    у каждого их них будет, оставленный вами,
                    детальный персональный прогноз самочувствия
                    с учётом наследственно-родовых особенностей!
                '''),
                html.Br(),
                html.Span('''
                    Приложение "Благодарие" не требует оплаты и регистрации -
                    все данные отправляются
                '''),
                html.A('обезличенными',
                    href=r'https://ru.wikisource.org/wiki/%D0%A4%D0%B5%D0%B4%D0%B5%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD_%D0%BE%D1%82_27.07.2006_%E2%84%96_152-%D0%A4%D0%97#%D0%A1%D1%82%D0%B0%D1%82%D1%8C%D1%8F_3._%D0%9E%D1%81%D0%BD%D0%BE%D0%B2%D0%BD%D1%8B%D0%B5_%D0%BF%D0%BE%D0%BD%D1%8F%D1%82%D0%B8%D1%8F,_%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D1%83%D0%B5%D0%BC%D1%8B%D0%B5_%D0%B2_%D0%BD%D0%B0%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B5%D0%BC_%D0%A4%D0%B5%D0%B4%D0%B5%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%BC_%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%D0%B5'
                ),
                html.Span('''
                    Ежедневно отмечайте улучшения и ухудшения самочувствия
                    и следите за результатами на этом сайте!
                '''),
                html.Br(),
                html.Br(),
            ],
            style={'textAlign': 'center'},
        )
    ])

    symptoms_list = []
    rc, data = request_json('/api/getstats/symptoms/names')
    if rc == 200:
        symptoms_list = data
    page_children.extend([
        dcc.Dropdown(
            id='dropdown-symptoms',
            options=[
                {'value': d['id'], 'label': d['name']} \
                for d in symptoms_list
            ],
            multi=True,
            value=[],
        ),
        html.Br(),
        html.Div(
            id='div-chart-user-symptoms',
        ),
    ])

    page_children.extend([
        html.Div([
                html.Br(),
                html.Span(
                    '''
                    Чтобы каждый мог убедиться в отсутствии вредоносных закладок и
                    нежелательной утечки личных данных,
                    а также присоединиться к разработке -
                    мы публикуем наш программный код под открытой лицензией
                    '''
                ),
                html.A(
                    'GPLv3:',
                    href='https://ru.wikipedia.org/wiki/GNU_General_Public_License',
                ),
                html.Br(),
                html.A(
                    'Код приложения Android',
                    href='https://github.com/6jlarogap/blagodarie',
                ),
                html.Br(),
                html.A(
                    'Код сайта',
                    href='https://github.com/6jlarogap/blagodarie-site',
                ),
                html.Br(),
                html.A(
                    'Код сервера',
                    href='https://github.com/6jlarogap/blagodarie-srv',
                ),
                html.Br(),
                html.Br(),
                html.A(
                    'Метрика',
                    href='https://metrika.yandex.ru/dashboard?id=62165461',
                ),
                html.Br(),
                html.Span(
                    'Обратная связь: 6jlarogap-at-mail.ru',
                ),
                html.Br(),
                html.A(
                    'Соглашение пользователя',
                    href='https://blagodarie.org/agreement',
                ),
                html.Br(),
                html.A(
                    'Для благодарности и поддержки:',
                    href='https://privetmir.ru/services/p2p/',
                ),
                html.Span(
                    ' 2200020206816318',
                ),
                html.Br(),
                html.A(
                    'Вверх',
                    title='Вернуться к началу страницы',
                    href='#',
                    style=dict(
                        color='green',
                        position='fixed',
                        left='45px',
                        bottom='45px',
                    ),
                ),
            ],
        )
    ])

    app.title = 'Благодарие'
    return html.Div(page_children)

app.layout = serve_layout

@app.callback(
    Output('div-chart-user-symptoms', 'children'),
    [
        Input('url', 'search'),
        Input('dropdown-symptoms', 'value'),
    ]
)
def update_chart_users_symptoms(search, value):
    result = []
    get_str = make_get_str(search, value)
    counts_all = counts_48h = counts_24h = titles = []
    rc, data = request_json('/api/getstats/symptoms/' + get_str)
    if rc == 200:
        counts_all = data['counts_all']
        counts_48h = data['counts_48h']
        counts_24h = data['counts_24h']
        titles = data['titles']
    any_counts_all = any(counts_all)
    if any_counts_all:
        figure_data =  [
            {
                'type': 'scatterpolar',
                'r': counts_all,
                'theta': titles,
                'fill': 'toself',
                'name': 'всего'
            },
            {
                'type': 'scatterpolar',
                'r': counts_48h,
                'theta': titles,
                'fill': 'toself',
                'name': 'За 48 часов'
            },
            {
                'type': 'scatterpolar',
                'r': counts_24h,
                'theta': titles,
                'fill': 'toself',
                'name': 'За 24 часа'
            },
        ]
        figure_layout = {
            'polar': {
                'radialaxis': {
                    'type': 'log',
                    'visible': True,
                }
            },
            'dragmode': False,
            'fixedrange': True,
            'showlegend': True,
            'width': 1050,
            'height': 700,
            'font': {
                'size': 14
            }
        }
        result.extend([
            html.H3(
                'Количества сообщений (всего, за 48 часов, за 24 часа)',
                style={'textAlign': 'center'},
            ),
            dcc.Graph(
                figure=dict(data=figure_data, layout=figure_layout),
                config = {'displayModeBar': False }
            )
        ])
    else:
        msg = 'Данные '
        if value:
            msg += 'по выбранным типам сообщений '
        msg += 'не поступали'
        result.extend([
            html.Div(
                html.B(msg),
                style={'textAlign': 'center'},
            )
        ])

    colors = named_colors()
    result.extend([
        html.H3(
            'Количества сообщений по последним 48 часам',
            style={'textAlign': 'center'},
        )
    ])
    if any_counts_all:
        rc, data = request_json('api/getstats/symptoms/hist/data/' + get_str)
        if rc == 200 and any(data['times']):
            fig = go.Figure()
            d_times = [
                {
                    'order': i,
                    'times': t,
                    'count': len(t),
                    'name': data['symptom_names'][str(i)]
                } \
                    for i, t in enumerate(data['times'])
            ]
            d_times.sort(key=cmp_to_key(cmp_symptoms_count_name))
            while len(colors) < len(data['times']):
                colors += colors
            tick_times = []
            t = data['time_1st']
            while t <= data['time_last']:
                tick_times.append(t)
                t += 3600
            tick_labels = []
            for i, t in enumerate(tick_times):
                tick_labels.append(datetime.datetime.fromtimestamp(t).strftime('%d.%m %H:00'))

            for d in d_times:
                fig.add_trace(go.Histogram(
                    type='histogram',
                    x=d['times'],
                    name=d['name'] + ' (' + str(d['count']) + ')',
                    marker=dict(color=colors[d['order']]),
                    xbins={
                        'start': data['time_1st'],
                        'end': data['time_last'],
                        'size': 3600,
                    },
                    hoverinfo="none",
                ))

            fig.update_layout(
                barmode='stack',
                xaxis={
                    'range': (data['time_1st'], data['time_last']),
                    'tickmode': 'array',
                    'tickvals': tick_times,
                    'ticktext': tick_labels,
                    'tickangle': -45,
                },
                yaxis={
                    'type': 'linear'
                },
            )
            result.extend([
                dcc.Graph(
                    figure=fig,
                    config = {'displayModeBar': False }
                )
            ])
        else:
            msg = 'За последние 48 часов данные '
            if value:
                msg += 'по выбранным типам сообщений'
            msg += 'не поступали'
            result.extend([
                html.Div(
                    html.B(msg),
                    style={'textAlign': 'center'},
                )
            ])

        rc, data = request_json('/api/getstats/symptoms/moon/data/' + get_str)
        if rc == 200 and data['moon_bars']:
            while len(colors) < len(data['moon_bars']):
                colors += colors
            d_symptoms = [
                {
                    'order': i,
                    'name': data['symptom_names'][str(i)],
                    'color': colors[i],
                    'count': sum(s),
                } \
                    for i, s in enumerate(data['moon_bars'])
            ]
            d_symptoms.sort(key=cmp_to_key(cmp_symptoms_count_name))
            figure_data = []
            x = [i for i in range(30) ]
            ticks = [str(i+1) for i in range(30)]
            ticks[data['current_moon_day']] = '*'
            for i, t in enumerate(ticks):
                ticks[i] += '<br>' + moon_phases[i]
            ticks[data['current_moon_day']] += '<br>' + datetime.datetime.now().strftime('%d.%m')
            for i, d in enumerate(d_symptoms):
                symptom_bars = data['moon_bars'][d['order']]
                if not symptom_bars:
                    continue
                figure_data.append({
                    'type': 'bar',
                    'name': d['name'] + ' (' + str(d['count']) + ')',
                    'x': x,
                    'y': symptom_bars,
                    'marker': dict(color=colors[d['order']],),
                    'hoverinfo': "none",
                })
            figure_layout = {
                'height': 800,
                'barmode': 'stack',
                'xaxis': {
                    'tickvals': x,
                    'ticktext': ticks,
                    'tickangle': 0,
                },
            }
            result.extend([
                html.H3(
                    'Распределение сообщений циклу Луны',
                    style={'textAlign': 'center'},
                ),
                dcc.Graph(
                    figure=dict(data=figure_data, layout=figure_layout),
                    config = {'displayModeBar': False }
                ),
            ])
            figure_data = []
            SIZE_TO_PX = 3
            DESIRED_MAX_SIZE = 20
            d_symptoms.reverse()
            for i, d in enumerate(d_symptoms):
                symptom_bubbles = data['moon_hour'][d['order']]
                if not symptom_bubbles:
                    continue
                x = []
                y = []
                size=[]
                max_count_in_hour = min(data['max_count_in_hour'], DESIRED_MAX_SIZE)
                for sb in symptom_bubbles:
                    for key in sb.keys():
                        x.append(key)
                        break
                    y.append(sb[key]['pos'])
                    size.append(sb[key]['count'] * SIZE_TO_PX)
                figure_data.append({
                    'type': 'scatter',
                    'name': d['name'] + ' (' + str(d['count']) + ')',
                    'x': x,
                    'y': y,
                    'mode': 'markers',
                    'marker': dict(
                        color=colors[d['order']],
                        opacity=0.5,
                        size=size,
                        sizemode='area',
                        sizeref=2. * max_count_in_hour / (DESIRED_MAX_SIZE ** 2),
                        sizemin=4,
                    ),
                    'hoverinfo': "none",
                })
            figure_layout = {
                'showlegend': True,
                'legend': {'itemsizing': 'constant'},
                'height': 800,
                'xaxis': {
                    'tickvals': [i for i in range(30)],
                    'ticktext': ticks,
                    'tickangle': 0,
                    'showgrid':False,
                    'showline':False,
                    'zeroline':False,
                },
                'yaxis': {
                    'tickvals': [i for i in range(25)],
                    'ticktext': [i for i in range(24)] + [0],
                    'tickangle': 0,
                    'showgrid':False,
                    'showline':False,
                    'zeroline':False,
                },
            }
            result.extend([
                html.H3(
                    'Распределение сообщений по часам и циклу Луны с учётом часового пояса',
                    style={'textAlign': 'center'},
                ),
                dcc.Graph(
                    figure=dict(data=figure_data, layout=figure_layout),
                    config = {'displayModeBar': False }
                ),
            ])


    return result

server = app.server

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0')

